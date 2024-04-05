import { QueryTypes } from 'sequelize';

export default function initDbMethods({ sequelize, models }) {
  const lessons = {
    search: ({
      offset,
      limit,
      startDate,
      endDate,
      status,
      teacherIds,
      studentsCountFrom,
      studentsCountTo,
    }) => {
      const lessonFilter = {
        date_between:
          startDate && endDate && `"lessons"."date" BETWEEN '${startDate}' AND '${endDate}'`,
        date_start: !endDate && startDate && `"lessons"."date" = '${startDate}'`,
        status: status && `"lessons"."status" = ${status}`,
        teacher_ids: teacherIds?.length > 0 && `"lesson_teachers"."teacher_id" IN (${teacherIds})`,
      };
      const studentsCountFilter = {
        students_between:
          studentsCountFrom &&
          studentsCountTo &&
          `GROUP BY "lessons"."id" HAVING COUNT(DISTINCT "lesson_students"."student_id") BETWEEN ${studentsCountFrom} AND ${studentsCountTo}`,
        students_count:
          !studentsCountTo &&
          studentsCountFrom &&
          `GROUP BY "lessons"."id" HAVING COUNT(DISTINCT "lesson_students"."student_id") = ${studentsCountFrom}`,
      };

      const lessonFilterOptionsList = Object.keys(lessonFilter).reduce(
        (optionsList, currentOptionName) => {
          if (lessonFilter[currentOptionName]) {
            optionsList.push(lessonFilter[currentOptionName]);
          }
          return optionsList;
        },
        [],
      );

      const lessonFilterStringFinal =
        lessonFilterOptionsList.length > 0 ? `WHERE ${lessonFilterOptionsList.join(' AND ')}` : '';

      // TODO use knex XD
      return sequelize.query(
        `
        -- Filter out lessons
        WITH filtered_lessons AS (
          SELECT DISTINCT
            "lessons"."id",
            "lessons"."date"
          FROM
            "lessons" AS "lessons"
          LEFT JOIN "lesson_teachers" AS "lesson_teachers" ON "lessons"."id" = "lesson_teachers"."lesson_id"
          LEFT JOIN "lesson_students" AS "lesson_students" ON "lessons"."id" = "lesson_students"."lesson_id"
          ${lessonFilterStringFinal}
          ${studentsCountFilter.students_between || studentsCountFilter.students_count || ''}
          LIMIT ${limit} OFFSET ${offset}
        )
        -- Get students and teachers details
        SELECT
          "lessons"."id",
          "lessons"."date",
          "lessons"."title",
          "lessons"."status",
          "teachers"."id" AS "teacher.id",
          "teachers"."name" AS "teacher.name",
          "students"."id" AS "student.id",
          "students"."name" AS "student.name",
          "students->lesson_students"."visit" AS "student.visit"
        FROM
          "lessons" AS "lessons"
        LEFT JOIN ("lesson_teachers" AS "teachers->lesson_teachers"
          LEFT JOIN "teachers" AS "teachers" ON "teachers"."id" = "teachers->lesson_teachers"."teacher_id") ON "lessons"."id" = "teachers->lesson_teachers"."lesson_id"
        LEFT JOIN ("lesson_students" AS "students->lesson_students"
          LEFT JOIN "students" AS "students" ON "students"."id" = "students->lesson_students"."student_id") ON "lessons"."id" = "students->lesson_students"."lesson_id"
        WHERE
          "lessons"."id" IN (SELECT "id" FROM filtered_lessons);
        `,
        {
          nest: true,
          type: QueryTypes.SELECT,
        },
      );
    },
  };

  return {
    lessons,
  };
}

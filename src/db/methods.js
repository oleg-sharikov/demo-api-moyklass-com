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
      // Filter lesson
      const lessonFilter = {
        date_between: startDate && endDate && `"date" BETWEEN '${startDate}' AND '${endDate}'`,
        date_start: !endDate && startDate && `"date" = '${startDate}'`,
        status: status && `"status" = ${status}`,
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

      // Filter joined data
      const additionalFilter = {
        teacher_ids: teacherIds?.length > 0 && `"teacher.id" IN (${teacherIds})`,
        students_between:
          studentsCountFrom &&
          studentsCountTo &&
          `"students_count" BETWEEN ${studentsCountFrom} AND ${studentsCountTo}`,
        students_count:
          !studentsCountTo && studentsCountFrom && `"students_count" = ${studentsCountFrom}`,
      };

      const additionalFilterOptionsList = Object.keys(additionalFilter).reduce(
        (optionsList, currentOptionName) => {
          if (additionalFilter[currentOptionName]) {
            optionsList.push(additionalFilter[currentOptionName]);
          }
          return optionsList;
        },
        [],
      );

      const additionalFilterStringFinal =
        additionalFilterOptionsList.length > 0
          ? `WHERE ${additionalFilterOptionsList.join(' AND ')}`
          : '';

      // TODO use knex XD
      return sequelize.query(
        `
        WITH lessons_ids AS (
          SELECT
            "id"
          FROM
            "lessons"
          ${lessonFilterStringFinal}
          LIMIT ${limit} OFFSET ${offset}
        )

        SELECT
          *
        FROM (
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
            "lessons"."id" IN (SELECT "id" FROM lessons_ids))
          AS lesson_students_teachers_details

          -- Count students
          JOIN (
            SELECT
              "lessons"."id", COUNT("students"."id") AS "students_count"
            FROM
              "lessons" AS "lessons"
              LEFT JOIN ("lesson_students" AS "students->lesson_students"
                LEFT JOIN "students" AS "students" ON "students"."id" = "students->lesson_students"."student_id") ON "lessons"."id" = "students->lesson_students"."lesson_id"
            WHERE
              "lessons"."id" IN (SELECT "id" FROM lessons_ids)
            GROUP BY
              "lessons"."id")
          AS enrolled_students_count
          ON lesson_students_teachers_details.id = enrolled_students_count.id
        ${additionalFilterStringFinal}
        ORDER BY "date" DESC;
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

import error from './error.js';
import config from './config.js';

export default async function initController(dbMethods) {
  async function searchLessons(req, res) {
    try {
      const page = req.query.page || 1;
      const lessonsPerPage = req.query.lessonsPerPage || config.api.lessonsPerPage;

      const searchPayload = {
        offset: (page - 1) * lessonsPerPage,
        limit: Number(lessonsPerPage),
        status: req.query.status,
        teacherIds: req.query.teacherIds,
      };

      if (req.query.date) {
        const [startDate, endDate] = req.query.date;
        searchPayload.startDate = startDate;
        searchPayload.endDate = endDate;
      }

      if (req.query.studentsCount) {
        const [studentsCountFrom, studentsCountTo] = req.query.studentsCount;
        searchPayload.studentsCountFrom = studentsCountFrom;
        searchPayload.studentsCountTo = studentsCountTo;
      }

      const lessonsData = await dbMethods.lessons.search(searchPayload);

      const lessonsDataMerged = lessonsData.reduce((lessonsList, currentLesson) => {
        const lesson = lessonsList.get(currentLesson.id);

        if (lesson) {
          lesson.students.set(currentLesson.student.id, currentLesson.student);
          lesson.teachers.set(currentLesson.teacher.id, currentLesson.teacher);
          return lessonsList;
        }

        lessonsList.set(currentLesson.id, {
          id: currentLesson.id,
          date: currentLesson.date,
          title: currentLesson.title,
          status: currentLesson.status,
          students: new Map(
            currentLesson.student.id && [[currentLesson.student.id, currentLesson.student]],
          ),
          teachers: new Map(
            currentLesson.teacher.id && [[currentLesson.teacher.id, currentLesson.teacher]],
          ),
        });
        return lessonsList;
      }, new Map());

      const lessonsDataTransformed = Array.from(lessonsDataMerged.values()).map(lesson => {
        const studentsArray = Array.from(lesson.students.values());
        return {
          ...lesson,
          visitCount: studentsArray.filter(student => student.visit).length,
          students: studentsArray,
          teachers: Array.from(lesson.teachers.values()),
        };
      });

      res.json(lessonsDataTransformed);
    } catch (err) {
      error.send('search_lessons_failed', err, res);
    }
  }

  return {
    searchLessons,
  };
}

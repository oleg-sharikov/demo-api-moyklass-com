import { DataTypes } from 'sequelize';

export default async function initDbModels(sequelize) {
  const lessons = sequelize.define(
    'lessons',
    {
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      title: {
        type: DataTypes.CHAR(100),
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      indexes: [
        {
          fields: ['date'],
        },
      ],
    },
  );

  const teachers = sequelize.define('teachers', {
    name: {
      type: DataTypes.CHAR(10),
    },
  });

  const students = sequelize.define('students', {
    name: {
      type: DataTypes.CHAR(10),
    },
  });

  sequelize.define('lesson_teachers', {
    lesson_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  sequelize.define('lesson_students', {
    lesson_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    visit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  lessons.belongsToMany(teachers, {
    through: 'lesson_teachers',
    sourceKey: 'id',
    targetKey: 'id',
    foreignKey: 'lesson_id',
    otherKey: 'teacher_id',
  });
  teachers.belongsToMany(lessons, {
    through: 'lesson_teachers',
    sourceKey: 'id',
    targetKey: 'id',
    foreignKey: 'teacher_id',
    otherKey: 'lesson_id',
  });

  lessons.belongsToMany(students, {
    through: 'lesson_students',
    sourceKey: 'id',
    targetKey: 'id',
    foreignKey: 'lesson_id',
    otherKey: 'student_id',
  });
  students.belongsToMany(lessons, {
    through: 'lesson_students',
    sourceKey: 'id',
    targetKey: 'id',
    foreignKey: 'student_id',
    otherKey: 'lesson_id',
  });

  return {
    lessons,
  };
}

const PostgresConnection = require("./db/connection.js");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
var pgc;
var course;
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post("/login", function (req, res) {
  pgc
    .executeQuery({
      text: 'SELECT * FROM public.login WHERE "user" = $1 AND "password" = $2',
      values: [req.body.user, req.body.password],
    })
    .then(({ rows }) => {
      res.json({ user: rows });
    })
    .catch((error) => {
      console.error(
        "[POSTGRESQL] Erro ao conectar ao executar uma query.\n ",
        error
      );
    });
});

app.get("/course", function (req, res) {
  course = req.body.course;

  pgc
    .executeQuery({
      text: "SELECT * FROM public.curso",
      values: [],
    })
    .then((ret) => {
      res.json(ret);
    })
    .catch((error) => {
      console.error(
        "[POSTGRESQL] Erro ao conectar ao executar uma query.\n ",
        error
      );
    });
});

app.post("/disciplines", function (req, res) {
  pgc
    .executeQuery({
      text: 'INSERT INTO public.DISCIPLINAS ("desc") VALUES ($1)',
      values: [req.body.discipline],
    })
    .then((ret) => {
      pgc
        .executeQuery({
          text: 'SELECT id FROM public.DISCIPLINAS where "desc" = $1;',
          values: [req.body.discipline],
        })
        .then((retDisciplina) => {
          pgc
            .executeQuery({
              text:
                'INSERT INTO public.rel_curso_disciplina ("id_curso", "id_disciplina", "teacher", "class_schedule")' +
                "VALUES($1, $2, $3, $4)",
              values: [
                req.body.course,
                retDisciplina.rows[0].id,
                req.body.teacher,
                req.body.classSchedule,
              ],
            })
            .then((ret) => {
              res.json({ status: "Inserido com sucesso!" });
            });
        });
    });
});

app.get("/courses/:id_course/disciplines", function (req, res) {
  var course_id = +req.params.id_course;
  pgc
    .executeQuery({
      text: `SELECT * FROM public.rel_curso_disciplina rcd
      INNER JOIN public.disciplinas d ON d.id = rcd.id_disciplina 
      WHERE rcd.id_curso = ${course_id}`,
      values: [],
    })
    .then((ret) => {
      res.json(ret.rows);
    })
    .catch((error) => {
      console.error("error in disciplines, GET - /disciplines", error);
    });
});

app.delete(
  "/courses/:course_id/discipline/:discipline_id",
  function (req, res) {
    var course_id = +req.params.course_id;
    var discipline_id = +req.params.discipline_id;
    pgc
      .executeQuery({
        text:
          "DELETE FROM public.rel_curso_disciplina AS rcd WHERE rcd.id_disciplina = " +
          discipline_id +
          "AND rcd.id_curso = " +
          course_id,
        values: [],
      })
      .then((ret) => {
        pgc.executeQuery({
          text:
            "DELETE FROM public.DISCIPLINAS AS d WHERE d.id = " +
            discipline_id,
          values: [],
        });
        res.json({ status: "Excluido." });
      })
      .catch((error) => {
        console.error(
          "[POSTGRESQL] Erro ao conectar ao executar uma query.\n ",
          error
        );
      });
  }
);

app.listen(3000, function () {
  console.info("[NODE] O aplicativo está funcionando.");
  pgc = new PostgresConnection();
});

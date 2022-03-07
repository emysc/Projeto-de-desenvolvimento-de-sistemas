var course, id_selected_course;

function login() {
  $.ajax({
    type: "POST",
    url: "http://localhost:3000/login",
    dataType: "json",
    data: JSON.stringify({
      user: $("#user").val(),
      password: $("#password").val(),
    }),
    contentType: "application/json",
    success: function (response) {
      //0 de array vazio, se ele voltar sem nada, tá errado
      if (response.user == 0) {
        $("body").append(`
        <div class="alertContent" style="background-color:  #c84545;
        ;">
            <span onclick="this.parentElement.style.display='none'"class="alert">x</span>
            <h3 >Senha/usuário errados!</h3>
        </div>
        `);
        return false;
      } else if (!response.user == 0) {
        $("body").append(`
        <div class="alertContent" style="background-color: #4CAF50;">
            <span onclick="this.parentElement.style.display='none'"class="alert">x</span>
            <h3 >Acertou a senha/usuário!</h3>
        </div>
        `);
        $("#login").remove();
        createHome();
        // alert("Acertou a senha!");
        return false;
      }
    },
    error: function (response) {
      console.error(response + ", Error ao fazer requisição ajax.");
    },
  });
}

function createHome() {
  $(".back").remove();
  $(".content").remove();
  $(".tableDisciplines").remove();
  $("#result").remove();

  $("body").append(`  <div class="content">
  <h1>Cadastro de matérias - IFB</h1>
  <div class = "boxOfCourses">
 
  <select class="course">
      <option class="course" value="1">Ciências da computação</option>
      <option class="course" value="2">Licenciatura de Dança</option>
      <option class="course" value="3">Pedagogia</option>
    </select>
    
  <button  class = "loginButton" onclick = "searchCourse()"> Buscar </button>
</div>

`);
}

function searchCourse() {
  id_selected_course = $(".course").val();
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/course",
    dataType: "json",
    data: JSON.stringify({
    }),
    contentType: "application/json",
    success: function (response) {
      if (id_selected_course == 1) {
        course = "Ciências da computação";
      } else if (id_selected_course == 3) {
        course = "Pedagogia";
      } else if (id_selected_course == 2) {
        course = "Licenciatura de dança";
      }

      $(".content").remove();
      $("body").append(
        ` <div class="content">
        <h1 >` +
          course +
          ` </h1></div>
        `
      );
      pageCourse();
    },
    error: function (response) {
      console.error(response + "Error ao fazer busca do curso.");
    },
  });
}

function addDiscipline() {
  $.ajax({
    type: "POST",
    url: "http://localhost:3000/disciplines",
    dataType: "json",
    data: JSON.stringify({
      discipline: $("#discipline").val(),
      teacher: $("#teacher").val(),
      classSchedule: $(".classSchedule").val(),
      course: id_selected_course,
    }),
    contentType: "application/json",
    success: function (response) {
      $("body").append(
        ` <div class="alertContent" style="background-color:  #4CAF50;
      ;">
      <span onclick="this.parentElement.style.display='none'"class="alert">x</span>
      <h3 >` +
          response.status +
          `</h3>
      </div>
      `
      );
      disciplines();
    },
    error: function (response) {
      console.error("Error ao adicionar matéria.");
    },
  });
}

function disciplines() {
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/courses/" + id_selected_course + "/disciplines",
    dataType: "json",
    data: JSON.stringify({}),
    contentType: "application/json",
    success: function (response) {
      $("#result").remove(); 
      if (!response || !response.length > 0) {
        $("body").append(`
        <div id="result">
        <table class="tableDisciplines" border="1">
         <tr>
          <th>Disciplina</th>
          <th>Professor</th>
          <th>Horário da aula</th>
          <th>Ações</th>
         </tr>
         <tr>
          <td colspan="4" style="text-align: center;">Não existem disciplinas cadastradas</td> 
        </tr>
        </table></div>
        `);
      } else {
        let string_result = `
        <div id="result">
        <table class="tableDisciplines" border="1">
         <tr>
          <th>Disciplina</th>
          <th>Professor</th>
          <th>Horário da aula</th>
          <th>Ações</th>
         </tr>
        `;

        for (const line of response) {
          string_result +=
            `
       <tr>
        <td>` +
            line.desc +
            `</td>
        <td>` +
            line.teacher +
            `</td>
        <td>` +
            line.class_schedule +
            `</td>
        <td>
          <button id = "buttonRemove" onclick="removeDiscipline(` +
            line.id_disciplina +
            `)"> x </button>
        </td>            
    </tr> `;
        }

        string_result += `</table></div>`;
        $("body").append(string_result);
      }
    },
    error: function () {
      console.error("error in disciplines, GET /disciplines");
    },
  });
}

function removeDiscipline(id_disciplina) {
  $.ajax({
    type: "DELETE",
    url:
      "http://localhost:3000/courses/" +
      id_selected_course +
      "/discipline/" +
      id_disciplina,
    dataType: "json",
    contentType: "application/json",
    success: function (response) {
      $("body").append(
        `  <div class="alertContent" style="background-color:  #4CAF50;
      ;">
      <span onclick="this.parentElement.style.display='none'"class="alert">x</span>
      <h3 >` +
          response.status +
          `</h3>
      </div>
      `
      );

      disciplines();
    },
  });
}

function pageCourse() {
  $("body").append(`  
  <div class="content">
    <div class = "boxOfCourses">
    <h3>Cadastrar nova disciplina</h3>
    <label for="">Disciplina</label>
    <input type="text" class="formControl" id = "discipline">
    <label for="">Professor</label>
    <input type="text" class="formControl" id = "teacher">
    <label for="">Horario da aula</label>
    <select class="classSchedule">
      <option class="classSchedule" value="Manhã">Manhã</option>
      <option class="classSchedule" value="Tarde">Tarde</option>
      <option class="classSchedule" value="Noite">Noite</option>
    </select>
  </div>
  <button class = "buttonCourse" onclick="addDiscipline()"> Adicionar </button>
  <button class="buttonCourse" onclick="createHome()">Voltar</button>
`);
  disciplines();
}

function showPassword() {
  var password = document.getElementById("password");

  if (password.type === "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
}

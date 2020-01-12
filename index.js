const generateHTML = require("./generateHTML");
const fs = require("fs");
const inquirer = require("inquirer");
const convertFactory = require("electron-html-to");
const open = require("open");
const api = require("./api");


const questions = [
   {
    type: "input",
    name: "github",
    message: "What is your GitHub username?"
  },

  {
    type: "list",
    name: "color",
    message: "What is your favorite color?",
    choices: ["red", "blue", "green", "pink"]
  }
];

function writeToFile(fileName, data) {
    return fs.writeFileSync(path.join(process.cwd(), fileName), data);
}

function init() {
    inquirer
    .prompt (questions)
.then(({ github, color }) => {
    console.log("Searching...");

    api
      .getUser(github)
      .then(response =>
        api.getTotalStars(github).then(stars => {
          return generateHTML({
            stars,
            color,
            ...response.data
          });
        })
      )
      .then(html => {
        const conversion = convertFactory({
          converterPath: convertFactory.converters.PDF
        });

        conversion({ html }, function(err, result) {
          if (err) {
            return console.error(err);
          }

          result.stream.pipe(
            fs.createWriteStream(path.join(__dirname, "resume.pdf"))
          );
          conversion.kill();
        });

        open(path.join(process.cwd(), "resume.pdf"));
      });
  });
}

init();

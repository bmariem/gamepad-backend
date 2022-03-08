# Gamepad API

API of Gamepad application - built to create a Rest API that consumes the [RAWG Video Games Database](https://api.rawg.io/docs/).

You can also [click here](https://github.com/bmariem/gamepad) to go to the front-end repository of this application.<hr>

## 💻 Functionalities/guidelines

✔️ A route of **games list**, accepting parameters of filters and pagination;<br>
✔️ A route of **game**, taking the game id as a parameter & listing all game details;<br>
✔️ **Authentication system** by using middleware & Mongoose model;<br>
✔️ Save **favorites games** in mongodb DataBase for a logged user ;<br>
✔️ A route of **Collection** displaying the list of favorite games : it is possible to add or remove them from this list;<br>

## 👩‍💻 Technologies and tools used:

- Javascript ES6+
- Nodejs
- npm
- Express | Axios | Cors
- Nodemon

## ▶️ How to run the project?

Before start, install [Git](https://git-scm.com/) in your machine.
Moreover, recommend use the [VSCode terminal}(https://code.visualstudio.com/).

Clone this repository :

```
git clone https://github.com/bmariem/gamepad-backend
cd gamepad-backend
```

Install packages :

```
npm install
```

When installation is complete, run it :

```
npm start
```

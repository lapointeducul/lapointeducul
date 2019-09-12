# lapointeducul

## Global requirement :
install GIT : https://git-scm.com/download

install Node.js (LTS) : https://nodejs.org/en/

install VsCode : https://code.visualstudio.com/

## Setup :
open a terminal, then type :

```
git clone https://github.com/lapointeducul/lapointeducul.git
cd lapointeducul
npm install
```

## Get latest version from Github
```
git pull
```

## Development server
```
npm start
```
For lauch a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Developpement
Go to `src/app` folder and make your magic here.

## Save on GitHub
```
npm run push --message="Update the website" 
```
then type user email and password when prompted.

## Deploy in prod

First time you want to deploy the website, run 

```
npx firebase login
```
else run 
```
npm run prod
```
to put online !

## Manage Episodes on the firebase cloud

go to https://console.firebase.google.com/?hl=fr


## Code scaffolding

Run `ng generate component component-name` to generate a new component. 

You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.



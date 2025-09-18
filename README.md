# CrowdMap

Have you ever wondered, what is happening around you? Which events may take place you have not heard about? CrowdMap provides people with the option to share events they are at and for you to see, where you might want to join in.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

- [node.js](https://nodejs.org/en/download/)

### Installing

A step by step series of examples that tell you how to get a development env running

Install the node deps. Go to the root directory and run
```
npm i
npm i --prefix frontend/
npm i --prefix backend/
```

Define environment variables: Go to ```/backend/``` and ```/frontend/```. Do the following steps in both directories. 
1. Create a copy of the file ```.env.example``` and rename it to ```.env``` 
2. Define the variables to your liking (Have a look [here](#environment-variables) for further information about each variable) 

Now you can either 
- open one terminal in each directories (```/backend/``` and ```/frontend/```) and start a **dev server** with the following command:

```
npm run dev
```

or


- open two terminals in the root directory and start a **preview server** with running each of the following commands in one terminal:

```
npm run start:backend
npm run start:frontend
```


After that, you can open a browser and connect to ```http://localhost:PORT_DEV```/```http://localhost:PORT_PREVIEW``` to see the frontend running.
You can also access ```http://localhost:YOUR_BACKEND_PORT/api-docs``` for a [swagger](https://swagger.io/) documentation for the backend API.
## Running the tests

### End to End Tests

>[!NOTE] 
To be done

### Integration Tests

>[!NOTE] 
To be done

### Unit Tests
>[!NOTE] 
To be done

### Static Code Checks
Static Code Checks are implemented via eslint. To execute them, simply run 
```
npm run lint 
```
in either of the directories ```/backend/``` and ```/frontend/```.

## Deployment

>[!NOTE] 
To be done

## Technical Details

### Built With

* [Express.js](https://expressjs.com/) - The backend web framework used
* [Vue.js](https://vuejs.org/) - The frontend framework used
* [Vite](https://vite.dev/) - The web bundler / build tool used

### Environment Variables

#### Frontend
Copy `/frontend/.env.example` to `/frontend/.env` and change the values:

| Variable              | Description                            | Default                 |
| --------------------- | -------------------------------------- | ----------------------- |
| `VITE_BACKEND_ORIGIN` | Backend Origin on same device for vite | `http://localhost:4000` |
| `PORT_DEV`            | Port for Frontend Dev Server           | `5173`                  |
| `PORT_PREVIEW`        | Port for Frontend Preview Server       | `4173`                  |


#### Backend
Copy `/backend/.env.example` to `/backend/.env` and change the values:

| Variable            | Description                                   | Default |
| ------------------- | --------------------------------------------- | ------- |
| `PORT`              | Port for Backend Server                       | `4000`  |
| `JWT_SECRET`        | Secret for jsonwebtoken                       | `none`  |
| `AUTH_TOKEN_TTL`    | Auth Token Time to Live                       | `"10m"` |
| `REFRESH_TOKEN_TTL` | Refresh Token Time to Live                    | `"7d"`  |
| `GEOAPIFY_API_KEY`  | [Geoapify](https://www.geoapify.com/) API Key | `none`  |



## Contributing

Since the project is its very early stages, I am not open to contributions at the moment. But thank you none the less for your interest :)
## Versioning

>[!NOTE] 
To be done
## Authors
 - [**EinfachNiklas**](https://github.com/EinfachNiklas) - *Initial work*

## License

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License version 3 only,
as published by the Free Software Foundation.
See the [LICENSE](https://github.com/EinfachNiklas/CrowdMap/blob/main/LICENSE) file for details

## Acknowledgments

* Thanks to [PurpleBooth](github.com/PurpleBooth) for the ```README.md``` template
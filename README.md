# ahwr-backoffice-ui

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_ahwr-backoffice-ui&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=DEFRA_ahwr-backoffice-ui)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_ahwr-backoffice-ui&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DEFRA_ahwr-backoffice-ui)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_ahwr-backoffice-ui&metric=coverage)](https://sonarcloud.io/summary/new_code?id=DEFRA_ahwr-backoffice-ui)

Created from Core delivery platform Node.js Frontend Template.

- [Requirements](#requirements)
  - [Node.js](#nodejs)
- [Server-side Caching](#server-side-caching)
- [Redis](#redis)
- [Local Development](#local-development)
  - [Setup](#setup)
  - [Development](#development)
  - [Production](#production)
  - [Npm scripts](#npm-scripts)
  - [Testing](#testing)
  - [Update dependencies](#update-dependencies)
  - [Formatting](#formatting)
    - [Windows prettier issue](#windows-prettier-issue)
- [Docker](#docker)
  - [Development image](#development-image)
  - [Production image](#production-image)
  - [Docker Compose](#docker-compose)
  - [Dependabot](#dependabot)
  - [SonarCloud](#sonarcloud)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Requirements

### Node.js

Please install [Node.js](http://nodejs.org/) `>= v22` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
cd ahwr-backoffice-ui
nvm use
```

# Service purpose

The backoffice UI service is responsible for the internal user interactions for administering applications and claims.
The feature-set includes the ability to list, and search for applications and claims,
navigate to the details of and manage application and claim, and to perform actions such as approving or rejecting
claims. Applications can be flagged, which highlights them and all of their associated claims inside the backoffice.

# User authentication and authorisation

Access to the backoffice UI is protected by Azure Active Directory (AAD) authentication and authorisation.
Only users with at least the 'user' role can access the application when deployed to non-local environments.
Specialist roles are provided for access to functionality that updates records.
Roles must be requested via service now requests per environment.

## Role list

| Role name     | Description                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| user          | Can access the backoffice UI and view applications, claims and flags. No updates can be performed                  |
| recommender   | In addition to user, can also move the status of claims to Recommended to pay, or recommended to reject            |
| authoriser    | In addition to user, can also move the status of claims to Ready to pay, or Rejected                               |
| administrator | Can perform both the recommender and authoriser roles, but never both for the same claim. Can add and remove flags |
| SuperAdmin    | Can perform limited data updates on claims and applications to correct mistakes etc                                |
| Support       | Can access support area to query debug info about items stored in the databases                                    |

# Management features

## Status updates

Claims can be moved through the following statuses:

- On Hold
- In Check
- Recommended to pay
- Recommended to reject
- Ready to pay
- Rejected

Claims will be created in either of In check or On Hold status, and once they are in check, they must be manually moved
into recommended to pay or reject, and then ready to pay or rejected.
Claims that are on hold can be moved into in check, but not directly into recommended to pay or reject.
The flow of statuses is one way only, with the exception of being able to move a claim back to in check status from
either recommended to pay or reject, by a Super Admin. Once a claim is Ready to pay, the status can no longer be updated.

There is a 2 step process for moving claims into recommended to pay or reject, and then ready to pay or rejected.
This is to allow for a 2 stage approval process, where one user can recommend a claim for payment or rejection,
and then another user can authorise that recommendation.

## Data updates

There are a limited number of data updates that can be performed on claims and applications, which currently
are:

- Update the date of visit for an application or claim
- Update the Vets name for a claim
- Update the Vets RCVS for a claim
- Mark an application as eligible/ineligible for data redaction by automated processes
- These updates are only available to users with the SuperAdmin role, and are designed to allow for correction of mistakes
  in data entry etc. They are not intended to allow for regular updates to claims and applications.
  All such changes must be accompanied by a note, and the change will be audited.

## Flags

Flags can be added to applications, which will highlight the application and all of its associated claims in the UI.
Administrators can add flags, and delete them, and all users can see the highlights as a result of adding a flag.
Flags are designed to allow for easy identification of applications and claims that require special attention,
such as those might need to be investigated for fraud, or have been identified as having a high risk of fraud.
They are not intended to be used for regular use cases such as marking an application as urgent etc.

# Caching

## Server-side Caching

We use Catbox for server-side caching. By default the service will use CatboxRedis when deployed and CatboxMemory for
local development.
You can override the default behaviour by setting the `SESSION_CACHE_ENGINE` environment variable to either `redis` or
`memory`.

Please note: CatboxMemory (`memory`) is _not_ suitable for production use! The cache will not be shared between each
instance of the service and it will not persist between restarts.

## Redis

Redis is an in-memory key-value store. Every instance of a service has access to the same Redis key-value store similar
to how services might have a database (or MongoDB). All frontend services are given access to a namespaced prefixed that
matches the service name. e.g. `my-service` will have access to everything in Redis that is prefixed with `my-service`.

If your service does not require a session cache to be shared between instances or if you don't require Redis, you can
disable setting `SESSION_CACHE_ENGINE=false` or changing the default value in `src/config/index.js`.

## Local Development

### Setup

Install application dependencies:

```bash
npm install
```

### Development

To run the application in `development` mode run:

```bash
./scripts/start
```

This will run the service is dockerised form, and will require you to also run an application-backend in order to serve
up the data for the frontend.

When running locally there is a dev auth mode, which will allow you inside without needing to authenticate with Azure AD.
To disable this, set the environment variable `AADAR_ENABLED` to `true` in your local `.env` file.

The dev auth will pick a random username by default, but this can be overridden by
navigating to `service/login?userId=<yourchosenuser>`.
You can choose to login as a user with a specific role by setting the userId to the name of the role,
e.g userId=authoriser, which will give you authoriser access.

### Npm scripts

All available Npm scripts can be seen in [package.json](./package.json)
To view them in your command line run:

```bash
npm run
```

### Testing

Out of the box, integration tests will fail using `npm run test`. This is due to missing a view called `layout.njk` under `app/view/layouts`

You could run `./scripts/test` to run tests, which will run the tests dockerized (there is a watch option available)

The other option is to run the `./scripts/start` to run the application in a dockerized environment and then copy out the `dist` folder,
so the view can be generated on your machine (once it is done once, you will not need the `dist` folder). The command to copy the files is:

```bash
docker cp {your_container_id}:/home/node/app/frontend/dist app/frontend/
```

You can retrieve the container id using docker by running

```bash
docker container ls
```

And then look for the container called `ahwr-backoffice-ui-development`

### Update dependencies

To update dependencies use [npm-check-updates](https://github.com/raineorshine/npm-check-updates):

> The following script is a good start. Check out all the options on
> the [npm-check-updates](https://github.com/raineorshine/npm-check-updates)

```bash
ncu --interactive --format group
```

### Formatting

#### Windows prettier issue

If you are having issues with formatting of line breaks on Windows update your global git config by running:

```bash
git config --global core.autocrlf false
```

## Docker

### Development image

> [!TIP]
> For Apple Silicon users, you may need to add `--platform linux/amd64` to the `docker run` command to ensure
> compatibility fEx: `docker build --platform=linux/arm64 --no-cache --tag ahwr-backoffice-ui`

Build:

```bash
docker build --target development --no-cache --tag ahwr-backoffice-ui:development .
```

Run:

```bash
docker run -p 3000:3000 ahwr-backoffice-ui:development
```

### Production image

Build:

```bash
docker build --no-cache --tag ahwr-backoffice-ui .
```

Run:

```bash
docker run -p 3000:3000 ahwr-backoffice-ui
```

### Docker Compose

A local environment with:

- Redis
- This service.

```bash
docker compose up --build -d
```

### Dependabot

We have added an example dependabot configuration file to the repository. You can enable it by renaming
the [.github/example.dependabot.yml](.github/example.dependabot.yml) to `.github/dependabot.yml`

### SonarCloud

This project is set up to integrate with sonarcloud, and scans will be performed on all pull requests, and on
publish to main branch. We follow the quality gates as per DEFRA standards, and if coverage falls below the
acceptable level, or new issues are introduced the build will fail.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

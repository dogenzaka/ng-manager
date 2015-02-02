ng-manager
====

Extensible management console running on angular and material design.

**This project is under development.**

Features
----

- Management console for your project

Requirements
----

- Simple REST API to your server

Development
----

ng-manager requires to be installed gulp before running. To install gulp, run

```
npm install -g gulp
```

To install dependencies, use bower.

```
bower install
```

Example server uses Google OAuth as authentication provider. Before starting, you
should set client info into environment variables.

```shell
export GOOGLE_CLIENT_ID=... 
export GOOGLE_CLIENT_SECRET=...
export GOOGLE_CALLBACK_URL=...
```

To run example server, run

```
gulp
```

Todo
----

- Authentication
- Jobs

License
----

ng-manager is under MIT license.


Wish
====

a Node.js web service framework

What is it?
-----------
The Wish framework consists of three levels:

1. functional syntactical sugar which replaces nested callbacks with a chain of responsibility and tightly integrates SQL
2. a declarative DSL for rapid definition and implementation of hypermedia APIs
3. a module system which allows reuse of boilerplate such as user entities, authentication, authorization, and audit logging

Use the levels you like but ignore the others. Note that the higher levels depend upon the lower levels.

Core Edicts
-----------
1. Wish is pure Javascript.
2. Wish adheres strictly to REST and HATEOAS design principles.
3. Wish is Test-Driven.
3. Wish (will) use git-flow.

How do I Wish?
--------------
TODO: elaborate

1. add the package to your package.json or npm install wish
2. import wish
3. wish away!

How does the Wish project work?
-------------------------------
clone the git repository

    git clone https://github.com/KyleCartmell/wish.git

install dependencies

    npm install

run unit tests

    npm test

run integration tests

    npm run-script integration-test

perform static analysis

    npm run-script static-analysis

TODO:

* continuous integration
* npm published

How can I help?
---------------
* find or create an issue in the github repository
* fork the project to your own github repository
* do some work and include relevant tests and documentation
* submit a pull request
* feel free to email kylecartmell@gmail.com
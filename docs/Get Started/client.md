# Client Architecture

The client is built as a Angular 13 component which is exported as a webcomponent. 
With this approach it can be integrated into any app, no matter the platform as long as it has a modern webview. 

## Trustie

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.0.2.

## Documentation

First install the mkdocs tools described here: [https://squidfunk.github.io/mkdocs-material/getting-started/](https://squidfunk.github.io/mkdocs-material/getting-started/)
To generate the documentation you can use `mkdocs serve`

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Architecture

The main part of the component is based in `projects/matrix/src/lib/matrix.component.ts`


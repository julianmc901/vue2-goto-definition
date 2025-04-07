# vue2-goto-definition

A simple Visual Studio Code extension that allows you to **go to the definition** of Vue 2 component methods, props, data, and computed properties even when the `<script src="">` is used.

## Features

- Detects definitions of methods, data, props, and computed values
- Works with external scripts via `<script src="./component.js">`
- Quick preview of the definition on hover

## Usage

1. Install the extension.
2. Open a Vue 2 component file.
3. Hover over a property or method used in the template.
4. A small preview box with the relevant definition will appear.

## Installation

Coming soon on [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/).

For now, clone this repo and run:

```bash
npm install
npm run package
code --install-extension vue2-goto-definition-0.0.1.vsix


**Author:** [jmuñoz](https://github.com/julianmc901/)

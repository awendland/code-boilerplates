## Synopsis

CHANGE_THIS

## Installation and Usage

### First setup:

  1. Make sure that `npm`, `tsd` and `gulp` are installed globally
    * `tsd` and `gulp` can be installed by running `npm install -g tsd` and `npm install -g gulp`
  2. `npm install`
  3. `tsd install`

### Development:

Run `gulp` to view available tasks.

`gulp build:*` commands will build TypeScript, or SASS, or HTML portions of the applications.

`gulp watch:*` commands will watch for file changes and run build commands as needed.

`gulp serve:*` commands will serve the generated files in the `out/` directory.

#### Recommended IDE:

Atom is a fast, customizable IDE with plenty of plugins for extended features.
Additionally, it has excellent TypeScript support as well as `.editorconfig`
handling.

**Recommended plugins:**

  * Atom TypeScript (atom-typescript)
    * Excellent syntax highlighting and support for TSX
    * Automatic reference completion
    * This will keep the tsconfig.json file up to date with new source TS files.
  * EditorConfig (editorconfig)
    * Standardizes indentation and whitespace configuration across developers
  * DocBlockr (docblockr)
    * Provides TypeScript and JS aware function documentation assistance
    * For example, typing `/**` then hitting 'enter' before a function definition will populate the comment documentation with the function's parameters

#### How to install new client libraries:

  1. Run `npm install --save CLIENT_LIBRARY`
  2. Edit `appconfig.json` to include a new entry with the key set to the library's name (as will be used by the `import` line in the source code), and the value as an object with the property `path` pointing to the `.js` file that is the distributable form of the library that should be included in `lib.js`
  3. Run `tsd query CLIENT_LIBRARY` to see if there is a TypeScript definition file for the library
    1. If there is a definition entry, run `tsd query CLIENT_LIBRARY --action install -s` to install the definition file and save it
      * Make sure the query is specific enough to only return one entry because the `--action install` will get applied to each result
    2. The run `tsd rebundle` two times in order to add the new definition file to `tsd.d.ts` properly

#### Misc. Things to Know:

  1. `styles.scss` maintains the order of imports for all SASS files

#### Troubleshooting Source:

  * If there is an import error when trying to use a library then TypeScript may be having some issues with the definition file and the library's export format.
    * If the library is exporting a raw function instead of an export object with a 'default' property, then use the raw *commonjs* `require` method to import instead. For example `import thunk from 'redux-thunk';` would become `const thunk = require('redux-thunk');`
    * If there is no `d.ts` definition for the module, you can write your own module definition in `src/ts/typings/custom.d.ts` or use the aforementioned `require()` method

#### Troubleshooting Builds:

  * If an error along the lines of

        src/ts/typings/tsd.d.ts(2,1): error TS6053: File '/home/jharvard/typings/react-redux/react-redux.d.ts' not found.

    ever arises, run `tsd install` then `tsd rebundle` to correct it.

  * If `gulp build` ever fails with an output related to

        events.js:72
                throw er; // Unhandled 'error' event
                      ^
        Error: EEXIST, mkdir '/home/jharvard/code/Datamatch-Client/out'

    Then run `mkdir out` in order to provide `gulp` with a destination to compile the source into.

#### Build System

  * Argument support for tasks, such as `gulp build --prod` to run a production
    level build. Or `gulp serve:watch --no-popup` to not launch a new browser
    window when the task starts.

## Contributors

This repository is maintained by CHANGE_THIS. Active developers are:

  - [Alex Wendland](https://github.com/awendland)

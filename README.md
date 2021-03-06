## Synopsis

This is a repo containing boilerplate templates for various project stacks. It can be used by the `fleshcode.py` for easy project setup.

## Motivation

I created this project in order to streamline to process for getting quick projects up and running. My goal is to have this repo come with everything that I need to get a project running, but nothing more. I am not looking to include anything that would have to be removed in other projects, only common libraries will make there way in here.

## Commands

`python fleshcode.py` will return a list of available templates to clone

`python fleshcode.py {template} {output_dir_name}` will clone the requested template into the provided directory name, then re-init the repo as a fresh git repository.

## Overview

A master config file in the root directory, called `templates.json` will contain basic info about the available templates.

## Contributors

[Alex Wendland](https://github.com/awendland) maintains this repository. You can open an issue on this repo to discuss any changes.

## License

```
The MIT License (MIT)

Copyright (c) <2014> <Alex Wendland>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
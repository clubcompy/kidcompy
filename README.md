Kidcompy
========

Kidcompy is a fun-loving character that lives at the heart of every computer


## Hacking on Kidcompy

You'll need Node.js installed on your local

Clone this repository onto your local, change directory into the kidcompy
folder, and run the following commands:

  git config user.name "<i>your_github_screen_name</i>"
  npm install -g gulp
  npm install

## Windows installation notes

I had a difficult time getting Kidcompy to build on Windows.  Having the latest
version of Node.js or Io.js installed along with Visual Studio 2013 Express for
Desktop made the difference for me.  

Proper compiler environment variables were required while trying to download 
JavaScript dependencies.  Some node libraries have binary components that need to
be compiled for your host system.  I found that ALWAYS running ANY 'npm ...' 
command from a "Developer Command Prompt for VS2013" console did the trick for 
giving npm unfettered access to the VS compiler tools from the command line.

Whenever things are failing mysteriously, delete your node_modules folder and 
re-run 'npm install' to get and build fresh copies of all the JavaScript 
dependencies.

If you have multiple versions of Visual Studio installed and npm is failing to
call the compiler tools successfully, I have read on the interwebs that you can 
force a specific version of visual studio to be called while doing an npm 
install, YMMV:

    npm install --msvs-version=2013

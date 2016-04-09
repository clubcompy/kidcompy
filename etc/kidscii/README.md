This folder contains the source data for the Kid-SCII character set as well as a generator for building a 
javascript module into the lib source tree that can be require'd and used at runtime by kidcompy modules.

To generate the loadable kidscii.js, run:

    node buildKidsciiJs
    
from this folder.  A `kid-SCII.js` will be written to lib/kidcompy/kidscii.

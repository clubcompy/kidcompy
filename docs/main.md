KidCompy developer portal
=========================

Introduction
------------
KidCompy is a computer simulation meant to resemble 80's 8-bit micros in appearance and function.  

We will be developing KidCompy using the web browser as the base platform, ideally without any additional plugin 
support like Java or Flash.  We will support two types of browsers in KidCompy: modern (c. 2013-onward) HTML5-compliant 
browsers and legacy Internet Explorer 6-8.  

The design goal with modern browsers is to achieve consistently high (60Hz) framerates on desktop and mobile and to 
exploit performance enhancers the platform offers (like Web Workers and ASM.js0 so that we squeeze every last ounce of 
performance out of the host.  The goal with legacy Internet Explorer support is to create any sort of functioning 
simulation at all, leveraging polyfills and exploit any fast paths that IE offers to create a usable environment.

A working prototype of the KidCompy operating environment looks like this:

![Screenshots of the original KidCompy prototype](./Prototype_Screenshots.png) 


KidCompy architectural tenets
-----------------------------

## Balance the challenge level posed by the environment to new developers

Systems for modern software development commonly provided to kids for learning about computers 
tend to fall into two classes:  too advanced or too constrained.  The too advanced systems are typically based on 
computer languages that adults use for regular productivity.  These computer languages carry with them all the 
baggage that assumes the kid will have an understanding of.  An understanding of command line tools, type systems, 
operating systems primitives, and linking with 3rd party software libraries are common prerequisites for kids before 
they can begin to build any significant computer program like the videogame of their dreams. 

Conversely, the too constrained systems work hard to create a simple drag n' drop, lego blocks building-style or visual 
oriented programming experience centered on event handling and displaying multimedia.  A focus on event triggering and 
handling is important and helps to teach program flow, but there are additional aspects of computer programming that 
these systems abstract away.  Data structures, recursion, math and trigonometric functions, and subroutines are a 
big part of a software developer's toolkit that can become glossed over in these constrained systems.

The KidCompy operating environment will try to strike a balance and offer expert computer programming features typical
of advanced systems while being easy to pick up and use, like constrained systems. 

     
     The design of KidCompy tries to strike a balance between being full-featured and being accessible to computer 
     newbies
  2. Built-in library programming environments (like BASIC on 8-bit micros) provide everything one needs to write a 
     program.  Just like BASIC, everything the computer can do can be documented as part of the language guide, which 
     is perfect for a beginner.  KidCompy will be a fully programmable virtual computer, but will still be simple enough 
     for kids learn to program on with the BASIC-like language the compy will make available at startup.
  3. Part of the fun of coding on the 80's era 8-bit microcomputers was working around the hardware limitations and 
     making the computer do something special.  KidCompy will have similar intentional "rough edges" and quirks to its
     design that will tease at interested your programmers' minds and challenge them to overcome.
  4. Being compatible with mobile browsers, KidCompy will open up a world of programming to mobile phone users who
     don't have access to a desktop computer.  Ideally, KidCompy can be a tool for learning how to program regardless
     of platform.

# Kidcompy main loop design thoughts

A Kidcompy main loop iteration is kicked off by the RequestAnimationFrame API call.  A call to RAF allows you to
register a callback to be called at the start of the next frame.  Between RAF being called and RAF callback being 
called, we expect the following to occur:

RequestAnimationFrame call
RequestAnimationFrame callback called

 * Record the start of the frame time
 * Flip the last frame's FlipBuffer from back to front
 * Process and dispatch queued browser events

Zero msec sleep, run an iteration of Tasty until it yields 
Zero msec sleep, mutate the DOM according to queued DOM Commands





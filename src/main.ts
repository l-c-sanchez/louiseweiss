require( 
    ['init'], 
  
    function (app: any) { 
        console.log("hey")
        app.start(); 
    }, 
  
    function (err: any) { 
        console.error('ERROR: ', err.requireType); 
        console.error('MODULES: ', err.requireModules); 
    } 
);

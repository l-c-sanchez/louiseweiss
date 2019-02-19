require(['init'], function (app) {
    console.log("hey");
    app.start();
}, function (err) {
    console.error('ERROR: ', err.requireType);
    console.error('MODULES: ', err.requireModules);
});
//# sourceMappingURL=main.js.map
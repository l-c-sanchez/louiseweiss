require(['init'], function (app) {
    app.start();
}, function (err) {
    console.error('ERROR: ', err.requireType);
    console.error('MODULES: ', err.requireModules);
});
//# sourceMappingURL=main.js.map
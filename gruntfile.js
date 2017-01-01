module.exports = function(grunt){

grunt.loadNpmTasks('grunt-contrib-uglify');

grunt.initConfig({
    uglify: {
        buildGame: {
            options: {
                sourceMap: true,
                sourceMapName: 'sourceMap.map'
            },
            src: 'public/javascripts/game/*.js',
            dest: 'public/javascripts/game/game.js'
        }
    }
});

grunt.registerTask('default', function(){
    
});

};

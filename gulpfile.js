var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');

gulp.task('default', function(){

});

gulp.task('less', function () {
  	gulp.src('public/stylesheets/*.less')
    .pipe(less({
      paths: [ 
      	path.join(__dirname, 'less', 'includes'),
      	'.',
        './node_modules/bootstrap-less'
      ]
    }))
    .pipe(gulp.dest('public/stylesheets'));
});
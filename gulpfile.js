var gulp = require('gulp'),

	// Server plugins
	express = require('express'),
	refresh = require('gulp-livereload'),
	lrserver = require('tiny-lr')(),
	livereload = require('connect-livereload'),

	// Other plugins
	open = require('gulp-open'),
	concat = require('gulp-concat'),
	sass = require('gulp-ruby-sass'),
	rimraf = require('gulp-rimraf'),
	minify = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),

	// Server settings
	lrport = 35729,
	serverport = 5000;


// Server configuration with livereload enabled
var server = express();
server.use(livereload({
	port: lrport
}));
server.use(express.static('./prod'));



// Server initiation and livereload, opens server in browser
gulp.task('serve', function() {
	server.listen(serverport);
	lrserver.listen(lrport);

	gulp.src('./prod/index.html')
	    .pipe(open('', {
	    	url: 'http://localhost:' + serverport
	    }));
});



// SASS compiling & reloading
gulp.task('sass', function () {
    gulp.src('./prod/sass/*.scss')
        .pipe(sass({
        	compass: true,
        	noCache: true,
        	quiet: true
        }))
        .pipe(gulp.dest('./prod/css'))
        .pipe(refresh(lrserver));
});

// JS concat
gulp.task('scripts', function() {
	gulp.src('./prod/js/ie/*.js')
		.pipe(concat('ie.js'))
		.pipe(gulp.dest('./prod/js'));

	gulp.src('./prod/js/header/*.js')
		.pipe(concat('header.js'))
		.pipe(gulp.dest('./prod/js'));

	gulp.src('./prod/js/footer/*.js')
		.pipe(concat('footer.js'))
		.pipe(gulp.dest('./prod/js'));

	gulp.src('./prod/js/*.js')
	    .pipe(refresh(lrserver));
});

// Clear 'dist' directory, then minifying, uglifying, & processing for build
gulp.task('remove', function() {
	gulp.src('./dist/**/*', { read: false })
		.pipe(rimraf());
});
gulp.task('minify', function() {
	gulp.src('./prod/css/*.css')
		.pipe(minify({
			keepSpecialComments: 0
		}))
		.pipe(gulp.dest('./dist/css'));
});
gulp.task('uglify', function() {
  	gulp.src('./prod/js/*.js')
    	.pipe(uglify())
    	.pipe(gulp.dest('./dist/js'));
});
gulp.task('imagemin', function () {
    gulp.src('./prod/img/**/*')
        .pipe(imagemin({
        	progressive: true
        }))
        .pipe(gulp.dest('./dist/img'));
});



// Watching files for changes before reloading
gulp.task('watch', function() {
	gulp.watch('./prod/sass/*.scss', function() {
		gulp.run('sass');
	});
	gulp.watch('./prod/img/**/*', function() {
		gulp.src('./prod/img/**/*')
		    .pipe(refresh(lrserver));
	});
	gulp.watch('./prod/js/**/*.js', function() {
		gulp.run('scripts');

	});
	gulp.watch('./prod/**/*.html', function() {
		gulp.src('./prod/**/*.html')
		    .pipe(refresh(lrserver));
	});
});


// Default functionality includes server with livereload and watching
gulp.task('default', function(){
	gulp.run(
		'sass',
		'scripts',
		'serve',
		'watch'
	);
});

// Build functionality with cleaning, moving, compiling, etc.
gulp.task('build', function(){
	gulp.run(
		'sass',
		'remove',
		'minify',
		'uglify',
		'imagemin'
	);
});
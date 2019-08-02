var gulpVersion   = '4'; // Gulp version: 3 or 4

var     gulp          = require('gulp'),
		gutil         = require('gulp-util' ),
		sass          = require('gulp-sass'),
		browserSync   = require('browser-sync'),
		concat        = require('gulp-concat'),
		uglify        = require('gulp-uglify'),
		cleancss      = require('gulp-clean-css'),
		rename        = require('gulp-rename'),
		autoprefixer  = require('gulp-autoprefixer'),
		notify        = require('gulp-notify'),
        clean         = require('gulp-clean'),
        babel         = require('gulp-babel'),
		sourceMap     = require('gulp-sourcemaps');

gulp.task('copyToDemo',function(){
	return gulp.src(['app/**/*','!app/sass/**/*'])
	.pipe(gulp.dest('docs')) // Create docs folder for gitHub page to show demo
});

gulp.task('cleanDemoDocsFolder', function () {
	return gulp.src('docs/', { read: false, allowEmpty: true })
		.pipe(clean());
});

gulp.task('demo', gulp.series(['cleanDemoDocsFolder','copyToDemo']));

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// open: false,
		// online: false, // Work Offline Without Internet Connection
		// tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
	})
});

gulp.task('styles', function() {
	return gulp.src('app/sass/**/*.+(scss|sass)')
	.pipe(sourceMap.init())
	.pipe(sass().on('error', sass.logError))
	.pipe(sourceMap.write())
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(rename({ 
		basename: 'style',
	}))
    .pipe(gulp.dest('app/css'))
	.pipe(browserSync.stream())
});
gulp.task('stylesMin', function() {
	return gulp.src('app/sass/**/*.+(scss|sass)')
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(rename({ 
		basename: 'style',
		suffix: '.min',
	}))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.stream())
});

gulp.task('scripts', function() {
	return gulp.src([
		//'app/libs/jquery/dist/jquery.min.js',
		'app/js/common.js', // Always at the end
		])
    .pipe(concat('scripts.min.js'))
    .pipe(babel({
        presets: ['@babel/env']
    }))
	.pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('code', function() {
	return gulp.src('app/*.html')
	.pipe(browserSync.reload({ stream: true }))
});


if (gulpVersion == 3) {
	gulp.task('watch', ['styles', 'stylesMin', 'scripts', 'browser-sync'], function() {
		gulp.watch('app/sass/**/*.+(scss|sass)', ['styles','stylesMin']);
		gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['scripts']);
		gulp.watch('app/*.html', ['code'])
	});
	gulp.task('default', ['watch','demo']);
}

if (gulpVersion == 4) {
	gulp.task('watch', function() {
		gulp.watch('app/sass/**/*.+(scss|sass)', gulp.parallel(['styles','stylesMin']));
		gulp.watch(['libs/**/*.js', 'app/js/common.js'], gulp.parallel('scripts'));
		gulp.watch('app/*.html', gulp.parallel('code'))
	});
	gulp.task('default', gulp.parallel('styles','stylesMin', 'scripts', 'browser-sync', 'watch','demo'));
}

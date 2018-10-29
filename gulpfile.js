const gulp         = require('gulp'),
       sass         = require('gulp-sass'),
       gcmq         = require('gulp-group-css-media-queries'),
	     autoprefixer = require('gulp-autoprefixer'),
	     concat       = require('gulp-concat'),
	     rename       = require('gulp-rename'),
	     cleanCss     = require('gulp-clean-css'),
	     uglifyjs     = require('gulp-uglifyjs'),
	     pngquant     = require('imagemin-pngquant'),
	     imagemin     = require('gulp-imagemin'),
	     del          = require('del'),
	     browserSync  = require('browser-sync').create(),
	     smartGrid    = require('smart-grid');

const cssFiles = [
	'./src/libs/normalize.css/normalize.css',
	'./src/css/style.css'
      ],

	    jsFiles = [
	    	'./src/libs/jQuery/dist/jquery.js',
	    	'./src/js/scripts.js',
			];

/* It's principal settings in smart grid project */
const settings = {
	outputStyle: 'scss', /* less || scss || sass || styl */
	columns: 12, /* number of grid columns */
	offset: '1rem', /* gutter width px || % || rem */
	mobileFirst: false, /* mobileFirst ? 'min-width' : 'max-width' */
	container: {
		maxWidth: '119.2rem', /* max-width оn very large screen */
		fields: '4rem' /* side fields */
	},
	breakPoints: {
		lg: {
			width: '1100px', /* -> @media (max-width: 1100px) */
		},
		md: {
			width: '960px'
		},
		sm: {
			width: '780px',
			fields: '1.5rem' /* set fields only if you want to change container.fields */
		},
		xs: {
			width: '560px'
		},
		/*
		We can create any quantity of break points.

		some_name: {
				width: 'Npx',
				fields: 'N(px|%|rem)',
				offset: 'N(px|%|rem)'
		}
		*/
	}
};

smartGrid('./src/scss/params/', settings);

function scss() {
	return gulp.src('./src/scss/**/*.scss')
		.pipe(sass())
		.pipe(gcmq())
		.pipe(gulp.dest('./src/css'))
		.pipe(browserSync.stream())
}

function styles() {
	return gulp.src(cssFiles)
		.pipe(concat('main.css'))
		.pipe(autoprefixer({
			browsers: ['> 0.1%'],
			cascade: false
		}))
		.pipe(gcmq())
		.pipe(gulp.dest('./src/css'))

}

function stylesMin() {
	return gulp.src('./src/css/main.css')
		.pipe(cleanCss({level: 2}))
		.pipe(rename({suffix: '.min' }))
		.pipe(gulp.dest('./src/css'))
		.pipe(browserSync.stream())
}
function scripts() {
	return gulp.src(jsFiles)
		.pipe(concat('libs.js'))
		.pipe(gulp.dest('./src/js'))
}

function scriptsMin() {
	return gulp.src('./src/js/libs.js')
		.pipe(uglifyjs({
			toplevel: true
		}))
		.pipe(rename({suffix: '.min' }))
		.pipe(gulp.dest('./src/js'))
		.pipe(browserSync.stream())
}
function watch() {
	browserSync.init({
		server: {
			baseDir: "./src/"
		},
		notify: false
	});
	gulp.watch('./src/*.html', browserSync.reload);
	gulp.watch('./src/scss/**/*.scss', scss);
	gulp.watch('./src/css/style.css', gulp.series(styles, stylesMin));
	gulp.watch('./src/js/scripts.js', gulp.series(scripts, scriptsMin));
	gulp.watch('./src/libs/**/*.js', gulp.series(scripts, scriptsMin));
}

function img() {
	return gulp.src('./src/img/**/*')
		.pipe(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest('./dist/img'))
}

function distHtml() {
	return gulp.src(['./src/*.html'])
		.pipe(gulp.dest('dist'))
}

function distCss() {
	return gulp.src(['./src/css/main.min.css'])
		.pipe(gulp.dest('./dist/css'))
}

function distJs() {
	return gulp.src(['./src/js/libs.min.js'])
		.pipe(gulp.dest('./dist/js'))
}

function distFonts() {
	return gulp.src(['./src/fonts/**/*'])
		.pipe(gulp.dest('./dist/fonts'))
}

function clean() {
	return del(['./dist/*'])
}

// gulp.task('scripts', scripts);
// gulp.task('watch', watch);
gulp.task('dist', gulp.series(clean, scss, styles, stylesMin, scripts, scriptsMin, distHtml, distCss, distJs, distFonts, img ));

gulp.task('default', watch);


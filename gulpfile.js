const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const fileInclude = require('gulp-file-include');
const del = require('del');
const sass = require('gulp-sass')(require('sass'));

// Xóa thư mục build cũ
gulp.task('clean', () => {
    return del(['build']);
});
// Task copy vendor libraries từ node_modules
gulp.task('vendor', () => {
    return gulp.src([
        'vendor/**/*'
    ])
        .pipe(gulp.dest('build/vendor'));
});

// Biên dịch SCSS sang CSS, nén và gộp
gulp.task('styles', () => {
    return gulp.src('scss/**/*.scss')
        .pipe(sass({ silenceDeprecations: ['legacy-js-api']}).on('error', sass.logError))
        .pipe(concat('styles.min.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.stream());
});

// Chuyển mã JavaScript sang ES5, nén và gộp
gulp.task('scripts', () => {
    return gulp.src('js/**/*.js')
        .pipe(babel({ presets: ['@babel/preset-env'] }))
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('build/js'))
        .pipe(browserSync.stream());
});

// Chèn partials vào HTML và nén HTML
gulp.task('html', () => {
    return gulp.src('src/*.html')
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('build'))
        .pipe(browserSync.stream());
});

// Tối ưu hình ảnh
gulp.task('images', () => {
    return gulp.src('images/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('build/images'));
});

// Khởi động BrowserSync và theo dõi các file
gulp.task('serve', () => {
    browserSync.init({
        server: {
            baseDir: './build'
        }
    });

    gulp.watch('scss/**/*.scss', gulp.series('styles'));
    gulp.watch('js/**/*.js', gulp.series('scripts'));
    gulp.watch('src/**/*.html', gulp.series('html'));
    gulp.watch('images/**/*', gulp.series('images')).on('change', browserSync.reload);
});

// Tác vụ build toàn bộ và khởi động hot reload
gulp.task('build', gulp.series('clean', gulp.parallel('styles', 'scripts', 'html', 'images')));
gulp.task('default', gulp.series('build', 'serve'));

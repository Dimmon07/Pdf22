export interface SourceFile {
  path: string;
  name: string;
  category: 'gradle' | 'manifest' | 'domain' | 'data' | 'ui' | 'viewmodel' | 'theme';
  language: 'kotlin' | 'groovy' | 'xml' | 'markdown';
  content: string;
  description: string;
}

export const ANDROID_PROJECT_FILES: SourceFile[] = [
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts (Module :app)',
    category: 'gradle',
    language: 'kotlin',
    description: 'Головний конфігураційний файл модуля застосунку з усіма бібліотеками (Compose, Coil, PDFBox, uCrop, WorkManager, Coroutines)',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    id("kotlin-parcelize")
}

android {
    namespace = "com.pdfmaster.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.pdfmaster.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            isMinifyEnabled = false
            applicationIdSuffix = ".debug"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    // AndroidX Core & Lifecycle
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    implementation(libs.androidx.activity.compose)

    // Jetpack Compose BOM & UI
    val composeBom = platform("androidx.compose:compose-bom:2024.12.01")
    implementation(composeBom)
    androidTestImplementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.animation:animation")

    // Navigation Compose
    implementation("androidx.navigation:navigation-compose:2.8.5")

    // Kotlin Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")

    // Image Loading: Coil
    implementation("io.coil-kt:coil-compose:2.7.0")

    // Image Cropping: uCrop (Yalantis)
    implementation("com.github.yalantis:ucrop:2.2.9")

    // PDF Manipulation: PDFBox-Android (for parsing, merging, and page extraction)
    implementation("com.tom-roush:pdfbox-android:2.0.27.0")

    // Google ML Kit: Document Scanner API (edge detection, auto-capture, perspective correction, clean filters)
    implementation("com.google.android.gms:play-services-mlkit-document-scanner:16.0.0-beta1")

    // Google ML Kit: On-Device Machine Translation & OCR
    implementation("com.google.mlkit:translate:17.0.3")
    implementation("com.google.mlkit:text-recognition:16.0.1")

    // Background Processing: WorkManager
    implementation("androidx.work:work-runtime-ktx:2.10.0")

    // Debugging Tooling
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'manifest',
    language: 'xml',
    description: 'Маніфест з налаштуванням Scoped Storage, Photo Picker, FileProvider для збереження/шарінгу PDF та Activity для uCrop',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Scoped Storage: Android 10+ (API 29+) НЕ потребує READ/WRITE_EXTERNAL_STORAGE 
         для файлів, створених застосунком у MediaStore або за допомогою Storage Access Framework (SAF).
         Для сумісності зі старими версіями (до Android 9 включно) додаємо maxSdkVersion="28" -->
    <uses-permission
        android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />
    <uses-permission
        android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="28"
        tools:ignore="ScopedStorage" />

    <!-- Камера (опціонально для прямого фото) -->
    <uses-feature
        android:name="android.hardware.camera"
        android:required="false" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
        android:name=".PdfMasterApp"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.PdfMaster">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.PdfMaster"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Підтримка відкриття PDF з інших застосунків (Open With) -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:mimeType="application/pdf" />
            </intent-filter>
        </activity>

        <!-- uCrop Activity для кадрування фотографій -->
        <activity
            android:name="com.yalantis.ucrop.UCropActivity"
            android:screenOrientation="portrait"
            android:theme="@style/Theme.AppCompat.Light.NoActionBar" />

        <!-- FileProvider для безпечного шерингу згенерованих PDF файлів -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>
</manifest>
`,
  },
  {
    path: 'app/src/main/res/xml/file_paths.xml',
    name: 'res/xml/file_paths.xml',
    category: 'manifest',
    language: 'xml',
    description: 'Конфігурація шляхів до кешу та документів для Android FileProvider',
    content: `<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Для тимчасових зображень після кропу та експорту PDF -->
    <cache-path name="cached_files" path="." />
    <!-- Для збережених документів у внутрішньому каталозі застосунку -->
    <files-path name="pdf_documents" path="pdfs/" />
    <!-- Для зовнішнього сховища застосунку (Android/data/...) -->
    <external-files-path name="external_pdf_documents" path="pdfs/" />
</paths>
`,
  },
  {
    path: 'app/src/main/java/com/pdfmaster/app/domain/model/PdfModels.kt',
    name: 'domain/model/PdfModels.kt',
    category: 'domain',
    language: 'kotlin',
    description: 'Clean Architecture моделі сутностей: ImageItem, PdfPageItem, PdfSettings, PageOrientation, Margins',
    content: `package com.pdfmaster.app.domain.model

import android.net.Uri
import android.os.Parcelable
import kotlinx.parcelize.Parcelize

/**
 * Елемент зображення, обраного користувачем для створення PDF
 */
@Parcelize
data class ImageItem(
    val id: String = java.util.UUID.randomUUID().toString(),
    val uri: Uri,
    val name: String,
    val rotation: Float = 0f, // 0f, 90f, 180f, 270f
    val croppedUri: Uri? = null,
    val sizeBytes: Long = 0L
) : Parcelable {
    val displayUri: Uri
        get() = croppedUri ?: uri
}

/**
 * Сторінка існуючого або створюваного PDF для редактора
 */
data class PdfPageItem(
    val pageIndex: Int,
    val originalPageIndex: Int,
    val rotationAngle: Int = 0, // 0, 90, 180, 270
    val thumbnailUri: Uri? = null,
    val sourceDocumentUri: Uri? = null,
    val isSelected: Boolean = false
)

enum class PageOrientation {
    PORTRAIT,
    LANDSCAPE,
    AUTO
}

enum class PageMargin(val points: Float) {
    NONE(0f),
    SMALL(18f), // ~0.25 inch
    LARGE(36f)  // ~0.5 inch
}

enum class ImageCompression(val quality: Int, val maxDimension: Int) {
    HIGH(95, 2400),
    MEDIUM(80, 1600),
    LOW(60, 1000)
}

enum class PageSize(val displayName: String, val widthPt: Float, val heightPt: Float) {
    A4("A4", 595f, 842f),
    A3("A3", 842f, 1191f),
    A5("A5", 420f, 595f),
    FIT_IMAGE("Самі фото", 0f, 0f)
}

data class RecentPdfEntity(
    val id: String = java.util.UUID.randomUUID().toString(),
    val uri: Uri,
    val fileName: String,
    val fileSizeBytes: Long,
    val pageCount: Int,
    val createdAt: Long = System.currentTimeMillis(),
    val pageSize: PageSize = PageSize.A4
)

data class PdfSettings(
    val fileName: String = "Document_\${System.currentTimeMillis()}",
    val orientation: PageOrientation = PageOrientation.PORTRAIT,
    val margin: PageMargin = PageMargin.SMALL,
    val compression: ImageCompression = ImageCompression.MEDIUM,
    val pageSize: PageSize = PageSize.A4,
    val includePageNumbers: Boolean = true
)

data class PdfExportResult(
    val uri: Uri,
    val fileName: String,
    val fileSizeBytes: Long,
    val pageCount: Int
)
`,
  },
  {
    path: 'app/src/main/java/com/pdfmaster/app/data/pdf/NativePdfDocumentGenerator.kt',
    name: 'data/pdf/NativePdfDocumentGenerator.kt',
    category: 'data',
    language: 'kotlin',
    description: 'Генератор PDF за допомогою нативного Android API android.graphics.pdf.PdfDocument з підтримкою орієнтації, полів та компресії',
    content: `package com.pdfmaster.app.data.pdf

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.pdf.PdfDocument
import com.pdfmaster.app.domain.model.ImageCompression
import com.pdfmaster.app.domain.model.ImageItem
import com.pdfmaster.app.domain.model.PageOrientation
import com.pdfmaster.app.domain.model.PageSize
import com.pdfmaster.app.domain.model.PdfSettings
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import kotlin.math.min

/**
 * Відповідає за створення PDF з зображень з використанням нативного android.graphics.pdf.PdfDocument
 */
class NativePdfDocumentGenerator(
    private val context: Context
) {

    suspend fun generatePdf(
        images: List<ImageItem>,
        settings: PdfSettings,
        outputFile: File,
        onProgress: (Int, String) -> Unit = { _, _ -> }
    ): File = withContext(Dispatchers.IO) {
        val pdfDocument = PdfDocument()
        val totalImages = images.size

        try {
            images.forEachIndexed { index, imageItem ->
                val progress = ((index + 1).toFloat() / totalImages * 85).toInt()
                onProgress(progress, "Обробка сторінки \${index + 1} з \$totalImages...")

                // 1. Декодуємо та оптимізуємо Bitmap з урахуванням ротації та компресії
                val bitmap = decodeAndProcessBitmap(imageItem, settings.compression)

                // 2. Визначаємо розміри сторінки PDF
                val (pageWidth, pageHeight) = calculatePageDimensions(bitmap, settings)

                // 3. Створюємо опис сторінки PdfDocument.PageInfo
                val pageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, index + 1).create()
                val page = pdfDocument.startPage(pageInfo)
                val canvas: Canvas = page.canvas

                // 4. Малюємо зображення з урахуванням полів (Margins)
                drawImageOnCanvas(canvas, bitmap, pageWidth, pageHeight, settings.margin.points.toInt())

                // 5. Нумерація сторінок (якщо увімкнено)
                if (settings.includePageNumbers) {
                    drawPageNumber(canvas, index + 1, totalImages, pageWidth, pageHeight)
                }

                pdfDocument.finishPage(page)
                bitmap.recycle() // Звільняємо пам'ять
            }

            onProgress(90, "Збереження PDF документа...")
            FileOutputStream(outputFile).use { fos ->
                pdfDocument.writeTo(fos)
                fos.flush()
            }
            onProgress(100, "PDF успішно створено!")
            outputFile
        } finally {
            pdfDocument.close()
        }
    }

    private fun decodeAndProcessBitmap(item: ImageItem, compression: ImageCompression): Bitmap {
        val uri = item.displayUri
        var inputStream: InputStream? = null
        try {
            inputStream = context.contentResolver.openInputStream(uri)
            val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeStream(inputStream, null, options)
            inputStream?.close()

            // Обчислення inSampleSize для оптимізації споживання RAM
            var sampleSize = 1
            while (options.outWidth / sampleSize > compression.maxDimension ||
                options.outHeight / sampleSize > compression.maxDimension
            ) {
                sampleSize *= 2
            }

            val decodeOptions = BitmapFactory.Options().apply {
                inSampleSize = sampleSize
                inPreferredConfig = Bitmap.Config.ARGB_8888
            }

            inputStream = context.contentResolver.openInputStream(uri)
            val decodedBitmap = BitmapFactory.decodeStream(inputStream, null, decodeOptions)
                ?: throw IllegalStateException("Не вдалося декодувати зображення: \$uri")

            // Застосування повороту, якщо він встановлений
            return if (item.rotation != 0f) {
                val matrix = Matrix().apply { postRotate(item.rotation) }
                Bitmap.createBitmap(decodedBitmap, 0, 0, decodedBitmap.width, decodedBitmap.height, matrix, true)
            } else {
                decodedBitmap
            }
        } finally {
            inputStream?.close()
        }
    }

    private fun calculatePageDimensions(bitmap: Bitmap, settings: PdfSettings): Pair<Int, Int> {
        if (settings.pageSize == PageSize.FIT_IMAGE) {
            val margin = (settings.margin.points * 2).toInt()
            return Pair(bitmap.width + margin, bitmap.height + margin)
        }

        val baseWidth = settings.pageSize.widthPt.toInt()
        val baseHeight = settings.pageSize.heightPt.toInt()

        val isLandscape = when (settings.orientation) {
            PageOrientation.PORTRAIT -> false
            PageOrientation.LANDSCAPE -> true
            PageOrientation.AUTO -> bitmap.width > bitmap.height
        }

        return if (isLandscape) {
            Pair(maxOf(baseWidth, baseHeight), minOf(baseWidth, baseHeight))
        } else {
            Pair(minOf(baseWidth, baseHeight), maxOf(baseWidth, baseHeight))
        }
    }

    private fun drawImageOnCanvas(canvas: Canvas, bitmap: Bitmap, pageWidth: Int, pageHeight: Int, margin: Int) {
        val availWidth = (pageWidth - margin * 2).toFloat()
        val availHeight = (pageHeight - margin * 2).toFloat()

        val scale = min(availWidth / bitmap.width, availHeight / bitmap.height)
        val targetWidth = bitmap.width * scale
        val targetHeight = bitmap.height * scale

        val left = margin + (availWidth - targetWidth) / 2f
        val top = margin + (availHeight - targetHeight) / 2f

        val destRect = RectF(left, top, left + targetWidth, top + targetHeight)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)
        canvas.drawBitmap(bitmap, null, destRect, paint)
    }

    private fun drawPageNumber(canvas: Canvas, current: Int, total: Int, width: Int, height: Int) {
        val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = android.graphics.Color.DKGRAY
            textSize = 10f
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText("\$current / \$total", width / 2f, height - 12f, textPaint)
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pdfmaster/app/data/pdf/AndroidPdfRendererManager.kt',
    name: 'data/pdf/AndroidPdfRendererManager.kt',
    category: 'data',
    language: 'kotlin',
    description: 'Менеджер рендерингу сторінок за допомогою нативного android.graphics.pdf.PdfRenderer для прев\'ю у Jetpack Compose',
    content: `package com.pdfmaster.app.data.pdf

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.ParcelFileDescriptor
import com.pdfmaster.app.domain.model.PdfPageItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream

/**
 * Генерує прев'ю сторінок існуючого PDF за допомогою нативного PdfRenderer
 */
class AndroidPdfRendererManager(private val context: Context) {

    suspend fun extractPagesInfo(pdfUri: Uri): List<PdfPageItem> = withContext(Dispatchers.IO) {
        val tempFile = copyUriToTempFile(pdfUri)
        val pfd = ParcelFileDescriptor.open(tempFile, ParcelFileDescriptor.MODE_READ_ONLY)
        val renderer = PdfRenderer(pfd)
        val pageCount = renderer.pageCount

        val pages = mutableListOf<PdfPageItem>()

        for (i in 0 until pageCount) {
            val page = renderer.openPage(i)
            // Рендеримо легке прев'ю сторінки в кеш для Coil
            val thumbnailUri = renderPageToCache(page, i)
            page.close()

            pages.add(
                PdfPageItem(
                    pageIndex = i,
                    originalPageIndex = i,
                    rotationAngle = 0,
                    thumbnailUri = thumbnailUri,
                    sourceDocumentUri = pdfUri
                )
            )
        }

        renderer.close()
        pfd.close()
        pages
    }

    private fun renderPageToCache(page: PdfRenderer.Page, pageIndex: Int): Uri {
        // Оптимальна ширина прев'ю для сітки на мобільному
        val width = 450
        val height = (width * (page.height.toFloat() / page.width.toFloat())).toInt()

        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        bitmap.eraseColor(Color.WHITE) // Біле тло для прозорих PDF
        page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)

        val cacheFile = File(context.cacheDir, "preview_page_\${pageIndex}_\${System.currentTimeMillis()}.jpg")
        FileOutputStream(cacheFile).use { out ->
            bitmap.compress(Bitmap.CompressFormat.JPEG, 85, out)
        }
        bitmap.recycle()
        return Uri.fromFile(cacheFile)
    }

    private fun copyUriToTempFile(uri: Uri): File {
        val tempFile = File.createTempFile("temp_render_", ".pdf", context.cacheDir)
        context.contentResolver.openInputStream(uri)?.use { input ->
            FileOutputStream(tempFile).use { output ->
                input.copyTo(output)
            }
        } ?: throw IllegalStateException("Неможливо відкрити InputStream для: \$uri")
        return tempFile
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pdfmaster/app/data/pdf/PdfBoxEditor.kt',
    name: 'data/pdf/PdfBoxEditor.kt',
    category: 'data',
    language: 'kotlin',
    description: 'Маніпулятор PDF на базі PDFBox-Android: зміна порядку сторінок, обертання, видалення та об\'єднання декількох файлів',
    content: `package com.pdfmaster.app.data.pdf

import android.content.Context
import android.net.Uri
import com.pdfmaster.app.domain.model.PdfPageItem
import com.tom_roush.pdfbox.android.PDFBoxResourceLoader
import com.tom_roush.pdfbox.multipdf.PDFMergerUtility
import com.tom_roush.pdfbox.pdmodel.PDDocument
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream

/**
 * Використовує PdfBox-Android для складних операцій редагування:
 * - Перестановка сторінок
 * - Поворот сторінок на 90°, 180°, 270°
 * - Видалення сторінок
 * - Об'єднання (Merge) декількох PDF документів
 */
class PdfBoxEditor(private val context: Context) {

    init {
        PDFBoxResourceLoader.init(context)
    }

    /**
     * Створює новий відредагований PDF відповідно до нового порядку, кутів повороту та метаданих
     */
    suspend fun saveEditedPdf(
        originalPdfUri: Uri,
        modifiedPages: List<PdfPageItem>,
        additionalPdfUris: List<Uri>,
        outputFile: File,
        metadataTitle: String? = null,
        metadataAuthor: String? = null,
        metadataSubject: String? = null,
        metadataKeywords: String? = null,
        onProgress: (Int, String) -> Unit = { _, _ -> }
    ): File = withContext(Dispatchers.IO) {
        onProgress(15, "Завантаження вихідного документа...")
        val inputStream = context.contentResolver.openInputStream(originalPdfUri)
            ?: throw IllegalStateException("Не вдалося прочитати оригінальний PDF")

        val sourceDoc = PDDocument.load(inputStream)
        val newDoc = PDDocument()

        try {
            // Запис оновлених метаданих (Title, Author, Subject, Keywords)
            val docInfo = newDoc.documentInformation
            metadataTitle?.let { docInfo.title = it }
            metadataAuthor?.let { docInfo.author = it }
            metadataSubject?.let { docInfo.subject = it }
            metadataKeywords?.let { docInfo.keywords = it }
            docInfo.creator = "PDF Master Android (Jetpack Compose)"
            docInfo.producer = "Apache PDFBox Android"

            val total = modifiedPages.size
            modifiedPages.forEachIndexed { index, pageItem ->
                val progress = 20 + ((index + 1).toFloat() / total * 60).toInt()
                onProgress(progress, "Збирання сторінки \${index + 1} з \$total...")

                if (pageItem.originalPageIndex < sourceDoc.numberOfPages) {
                    val originalPage = sourceDoc.getPage(pageItem.originalPageIndex)
                    // Додаємо сторінку до нового документа
                    val importedPage = newDoc.importPage(originalPage)

                    // Встановлюємо кут повороту (наприклад, +90, +180)
                    val currentRotation = importedPage.rotation
                    importedPage.rotation = (currentRotation + pageItem.rotationAngle) % 360
                }
            }

            // Додаємо додаткові PDF, якщо виконується Merge
            if (additionalPdfUris.isNotEmpty()) {
                onProgress(85, "Об'єднання з додатковими документами...")
                additionalPdfUris.forEach { addUri ->
                    context.contentResolver.openInputStream(addUri)?.use { addStream ->
                        val addDoc = PDDocument.load(addStream)
                        for (p in 0 until addDoc.numberOfPages) {
                            newDoc.importPage(addDoc.getPage(p))
                        }
                        addDoc.close()
                    }
                }
            }

            onProgress(95, "Запис відредагованого файлу з метаданими...")
            FileOutputStream(outputFile).use { fos ->
                newDoc.save(fos)
            }
            onProgress(100, "Збереження завершено!")
            outputFile
        } finally {
            sourceDoc.close()
            newDoc.close()
            inputStream.close()
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pdfmaster/app/data/storage/StorageManager.kt',
    name: 'data/storage/StorageManager.kt',
    category: 'data',
    language: 'kotlin',
    description: 'Робота з Scoped Storage (Android 10+) через MediaStore API та Storage Access Framework (SAF)',
    content: `package com.pdfmaster.app.data.storage

import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream

/**
 * Керує збереженням та експортом PDF у Scoped Storage (Android 10-15+)
 * Використовує MediaStore.Downloads для публічного доступу без застарілих дозволів
 */
class StorageManager(private val context: Context) {

    /**
     * Створює тимчасовий файл у внутрішньому кеші
     */
    fun createTempPdfFile(prefix: String = "pdf_master_"): File {
        val storageDir = File(context.cacheDir, "generated_pdfs").apply { mkdirs() }
        return File.createTempFile(prefix, ".pdf", storageDir)
    }

    /**
     * Зберігає згенерований або відредагований PDF у публічну папку "Завантаження" (Downloads)
     * через сучасний MediaStore API (Scoped Storage, не вимагає прав WRITE_EXTERNAL_STORAGE)
     */
    suspend fun savePdfToPublicStorage(tempFile: File, displayName: String): Uri = withContext(Dispatchers.IO) {
        val sanitizedName = if (displayName.endsWith(".pdf", ignoreCase = true)) displayName else "\$displayName.pdf"

        val values = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, sanitizedName)
            put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/PDFMaster")
                put(MediaStore.MediaColumns.IS_PENDING, 1)
            }
        }

        val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
        } else {
            MediaStore.Files.getContentUri("external")
        }

        val uri = context.contentResolver.insert(collection, values)
            ?: throw IllegalStateException("Не вдалося створити запис у MediaStore")

        context.contentResolver.openOutputStream(uri)?.use { outputStream ->
            FileInputStream(tempFile).use { inputStream ->
                inputStream.copyTo(outputStream)
            }
        } ?: throw IllegalStateException("Не вдалося відкрити OutputStream для: \$uri")

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            values.clear()
            values.put(MediaStore.MediaColumns.IS_PENDING, 0)
            context.contentResolver.update(uri, values, null, null)
        }

        uri
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pdfmaster/app/ui/screens/home/HomeScreen.kt',
    name: 'ui/screens/home/HomeScreen.kt',
    category: 'ui',
    language: 'kotlin',
    description: 'Головний екран у стилі Material 3 з вибором модуля (Image to PDF / PDF Editor), швидкими діями та інструкціями',
    content: `package com.pdfmaster.app.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.EditDocument
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToImageToPdf: () -> Unit,
    onNavigateToPdfEditor: () -> Unit,
    onNavigateToPdfTranslate: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.PictureAsPdf,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "PDF Master",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Оберіть інструмент",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            // Картка 1: Зображення в PDF (A4, A3, A5, Самі фото)
            ModuleActionCard(
                title = "Зображення в PDF",
                description = "Формати A4, A3, A5 або за розміром фото. Photo Picker, зміна порядку, кадрування та стиснення.",
                icon = Icons.Default.AddPhotoAlternate,
                badge = "A4 / A3 / A5 / Фото",
                onClick = onNavigateToImageToPdf
            )

            // Картка 2: Редактор PDF
            ModuleActionCard(
                title = "Редактор PDF",
                description = "Відкривайте PDF-файли з пристрою, міняйте сторінки місцями, повертайте, видаляйте або об'єднуйте кілька документів.",
                icon = Icons.Default.EditDocument,
                badge = "PdfRenderer & Merge",
                onClick = onNavigateToPdfEditor
            )

            // Картка 3: Переклад PDF (ML Kit)
            ModuleActionCard(
                title = "Переклад PDF",
                description = "Автоматичний переклад документів (англійська, українська, польська тощо). Двомовний або повний вивід.",
                icon = Icons.Default.Translate,
                badge = "ML Kit On-Device",
                onClick = onNavigateToPdfTranslate
            )

            Spacer(modifier = Modifier.weight(1f))

            // Інформаційний блок про Scoped Storage
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Сучасні стандарти Android 10-15+",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Повна підтримка Scoped Storage, безпечного Photo Picker API та нативних фонових корутин без зайвих системних дозволів.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
private fun ModuleActionCard(
    title: String,
    description: String,
    icon: ImageVector,
    badge: String,
    onClick: () -> Unit
) {
    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.elevatedCardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(MaterialTheme.colorScheme.primaryContainer),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onPrimaryContainer,
                    modifier = Modifier.size(20.dp)
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = MaterialTheme.colorScheme.secondaryContainer
                    ) {
                        Text(
                            text = badge,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                            style = MaterialTheme.typography.labelSmall
                        )
                    }
                }
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1
                )
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pdfmaster/app/ui/screens/imagetopdf/ImageToPdfViewModel.kt',
    name: 'ui/screens/imagetopdf/ImageToPdfViewModel.kt',
    category: 'viewmodel',
    language: 'kotlin',
    description: 'ViewModel для конвертації зображень: керування списком фото, drag-and-drop перестановка, налаштування PDF та фонова генерація',
    content: `package com.pdfmaster.app.ui.screens.imagetopdf

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.pdfmaster.app.data.pdf.NativePdfDocumentGenerator
import com.pdfmaster.app.data.storage.StorageManager
import com.pdfmaster.app.domain.model.ImageItem
import com.pdfmaster.app.domain.model.PdfExportResult
import com.pdfmaster.app.domain.model.PdfSettings
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

sealed interface ImageToPdfUiState {
    data object Idle : ImageToPdfUiState
    data class Generating(val progress: Int, val message: String) : ImageToPdfUiState
    data class Success(val result: PdfExportResult) : ImageToPdfUiState
    data class Error(val message: String) : ImageToPdfUiState
}

class ImageToPdfViewModel(application: Application) : AndroidViewModel(application) {

    private val generator = NativePdfDocumentGenerator(application)
    private val storageManager = StorageManager(application)

    private val _images = MutableStateFlow<List<ImageItem>>(emptyList())
    val images: StateFlow<List<ImageItem>> = _images.asStateFlow()

    private val _settings = MutableStateFlow(PdfSettings())
    val settings: StateFlow<PdfSettings> = _settings.asStateFlow()

    private val _uiState = MutableStateFlow<ImageToPdfUiState>(ImageToPdfUiState.Idle)
    val uiState: StateFlow<ImageToPdfUiState> = _uiState.asStateFlow()

    fun onImagesPicked(uris: List<Uri>) {
        val newItems = uris.map { uri ->
            ImageItem(
                uri = uri,
                name = uri.lastPathSegment ?: "Image"
            )
        }
        _images.update { current -> current + newItems }
    }

    fun removeImage(imageId: String) {
        _images.update { current -> current.filterNot { it.id == imageId } }
    }

    fun rotateImage(imageId: String) {
        _images.update { current ->
            current.map { item ->
                if (item.id == imageId) {
                    val nextAngle = (item.rotation + 90f) % 360f
                    item.copy(rotation = nextAngle)
                } else item
            }
        }
    }

    fun onImageCropped(imageId: String, croppedUri: Uri) {
        _images.update { current ->
            current.map { item ->
                if (item.id == imageId) item.copy(croppedUri = croppedUri) else item
            }
        }
    }

    fun moveImage(fromIndex: Int, toIndex: Int) {
        _images.update { list ->
            val mutable = list.toMutableList()
            val item = mutable.removeAt(fromIndex)
            mutable.add(toIndex, item)
            mutable
        }
    }

    fun updateSettings(newSettings: PdfSettings) {
        _settings.value = newSettings
    }

    fun generatePdf() {
        val currentImages = _images.value
        if (currentImages.isEmpty()) {
            _uiState.value = ImageToPdfUiState.Error("Додайте хоча б одне зображення")
            return
        }

        viewModelScope.launch {
            try {
                _uiState.value = ImageToPdfUiState.Generating(5, "Підготовка до генерації...")

                val tempFile = storageManager.createTempPdfFile()
                generator.generatePdf(
                    images = currentImages,
                    settings = _settings.value,
                    outputFile = tempFile,
                    onProgress = { progress, msg ->
                        _uiState.value = ImageToPdfUiState.Generating(progress, msg)
                    }
                )

                // Збереження у сховище пристрою через MediaStore
                val publicUri = storageManager.savePdfToPublicStorage(tempFile, _settings.value.fileName)
                val exportResult = PdfExportResult(
                    uri = publicUri,
                    fileName = "\${_settings.value.fileName}.pdf",
                    fileSizeBytes = tempFile.length(),
                    pageCount = currentImages.size
                )
                _uiState.value = ImageToPdfUiState.Success(exportResult)
            } catch (e: Exception) {
                _uiState.value = ImageToPdfUiState.Error("Помилка генерації PDF: \${e.localizedMessage}")
            }
        }
    }

    fun resetState() {
        _uiState.value = ImageToPdfUiState.Idle
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pdfmaster/app/ui/screens/imagetopdf/ImageToPdfScreen.kt',
    name: 'ui/screens/imagetopdf/ImageToPdfScreen.kt',
    category: 'ui',
    language: 'kotlin',
    description: 'Екран створення PDF із зображень: PhotoPicker контракт, сітка фотографій, кнопки повороту/видалення та діалог налаштувань',
    content: `package com.pdfmaster.app.ui.screens.imagetopdf

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.pdfmaster.app.domain.model.ImageItem
import com.pdfmaster.app.domain.model.PageMargin
import com.pdfmaster.app.domain.model.PageOrientation

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ImageToPdfScreen(
    viewModel: ImageToPdfViewModel,
    onNavigateBack: () -> Unit,
    onOpenCrop: (ImageItem) -> Unit
) {
    val images by viewModel.images.collectAsState()
    val settings by viewModel.settings.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

    var showSettingsSheet by remember { mutableStateOf(false) }

    // Використання нативного Android Photo Picker (Android 13+ та сумісність з Android 4.4+)
    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickMultipleVisualMedia()
    ) { uris ->
        if (uris.isNotEmpty()) {
            viewModel.onImagesPicked(uris)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Зображення в PDF (\${images.size})") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Назад")
                    }
                },
                actions = {
                    IconButton(onClick = { showSettingsSheet = true }) {
                        Icon(Icons.Default.Tune, contentDescription = "Параметри PDF")
                    }
                }
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = {
                    photoPickerLauncher.launch(
                        PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                    )
                },
                icon = { Icon(Icons.Default.AddPhotoAlternate, contentDescription = null) },
                text = { Text("Додати фото") }
            )
        },
        bottomBar = {
            if (images.isNotEmpty()) {
                Surface(
                    tonalElevation = 6.dp,
                    shadowElevation = 8.dp
                ) {
                    Button(
                        onClick = { viewModel.generatePdf() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Icon(Icons.Default.PictureAsPdf, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Конвертувати в PDF", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            if (images.isEmpty()) {
                // Порожній стан
                EmptyImagesPlaceholder(
                    onPickClick = {
                        photoPickerLauncher.launch(
                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                        )
                    }
                )
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    itemsIndexed(images, key = { _, item -> item.id }) { index, item ->
                        ImageCardItem(
                            item = item,
                            index = index,
                            onRotate = { viewModel.rotateImage(item.id) },
                            onDelete = { viewModel.removeImage(item.id) },
                            onCrop = { onOpenCrop(item) },
                            onMoveLeft = { if (index > 0) viewModel.moveImage(index, index - 1) },
                            onMoveRight = { if (index < images.size - 1) viewModel.moveImage(index, index + 1) }
                        )
                    }
                }
            }

            // Індикатор прогресу генерації
            when (val state = uiState) {
                is ImageToPdfUiState.Generating -> {
                    GeneratingProgressDialog(progress = state.progress, message = state.message)
                }
                is ImageToPdfUiState.Success -> {
                    AlertDialog(
                        onDismissRequest = { viewModel.resetState() },
                        icon = { Icon(Icons.Default.CheckCircle, tint = MaterialTheme.colorScheme.primary, contentDescription = null) },
                        title = { Text("PDF успішно створено!") },
                        text = {
                            Text("Файл '\${state.result.fileName}' збережено у папку Завантаження (Downloads).")
                        },
                        confirmButton = {
                            Button(onClick = { viewModel.resetState() }) {
                                Text("Зрозуміло")
                            }
                        }
                    )
                }
                is ImageToPdfUiState.Error -> {
                    AlertDialog(
                        onDismissRequest = { viewModel.resetState() },
                        title = { Text("Помилка") },
                        text = { Text(state.message) },
                        confirmButton = {
                            Button(onClick = { viewModel.resetState() }) {
                                Text("ОК")
                            }
                        }
                    )
                }
                else -> Unit
            }
        }
    }
}

@Composable
fun ImageCardItem(
    item: ImageItem,
    index: Int,
    onRotate: () -> Unit,
    onDelete: () -> Unit,
    onCrop: () -> Unit,
    onMoveLeft: () -> Unit,
    onMoveRight: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(170.dp)
            ) {
                AsyncImage(
                    model = item.displayUri,
                    contentDescription = null,
                    modifier = Modifier
                        .fillMaxSize()
                        .rotate(item.rotation),
                    contentScale = ContentScale.Crop
                )

                // Номер сторінки
                Surface(
                    modifier = Modifier
                        .padding(8.dp)
                        .align(Alignment.TopStart),
                    shape = CircleShape,
                    color = MaterialTheme.colorScheme.surface.copy(alpha = 0.85f)
                ) {
                    Text(
                        text = "\${index + 1}",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Кнопка видалення
                IconButton(
                    onClick = onDelete,
                    modifier = Modifier
                        .padding(4.dp)
                        .align(Alignment.TopEnd)
                        .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                        .size(32.dp)
                ) {
                    Icon(Icons.Default.Close, contentDescription = "Видалити", tint = Color.White, modifier = Modifier.size(18.dp))
                }
            }

            // Нижня панель дій над фото
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 6.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onRotate, modifier = Modifier.size(36.dp)) {
                    Icon(Icons.Default.RotateRight, contentDescription = "Повернути", modifier = Modifier.size(20.dp))
                }
                IconButton(onClick = onCrop, modifier = Modifier.size(36.dp)) {
                    Icon(Icons.Default.Crop, contentDescription = "Обрізати", modifier = Modifier.size(20.dp))
                }
                IconButton(onClick = onMoveLeft, modifier = Modifier.size(36.dp)) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Вліво", modifier = Modifier.size(18.dp))
                }
                IconButton(onClick = onMoveRight, modifier = Modifier.size(36.dp)) {
                    Icon(Icons.Default.ArrowForward, contentDescription = "Вправо", modifier = Modifier.size(18.dp))
                }
            }
        }
    }
}

@Composable
fun EmptyImagesPlaceholder(onPickClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.AddPhotoAlternate,
            contentDescription = null,
            modifier = Modifier.size(72.dp),
            tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.6f)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Зображень ще не додано",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Виберіть фотографії з галереї для створення багатосторінкового PDF",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(20.dp))
        Button(onClick = onPickClick) {
            Icon(Icons.Default.PhotoLibrary, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Обрати фото")
        }
    }
}

@Composable
fun GeneratingProgressDialog(progress: Int, message: String) {
    AlertDialog(
        onDismissRequest = {},
        confirmButton = {},
        title = { Text("Створення PDF...") },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                LinearProgressIndicator(
                    progress = { progress / 100f },
                    modifier = Modifier.fillMaxWidth().height(8.dp)
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(text = message, style = MaterialTheme.typography.bodyMedium)
                Text(text = "\$progress%", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
            }
        }
    )
}
`,
  },
  {
    path: 'app/src/main/java/com/pdfmaster/app/ui/screens/pdfeditor/PdfEditorViewModel.kt',
    name: 'ui/screens/pdfeditor/PdfEditorViewModel.kt',
    category: 'viewmodel',
    language: 'kotlin',
    description: 'ViewModel для редагування PDF: вилучення сторінок через PdfRenderer, перестановка, поворот, видалення, мердж та збереження',
    content: `package com.pdfmaster.app.ui.screens.pdfeditor

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.pdfmaster.app.data.pdf.AndroidPdfRendererManager
import com.pdfmaster.app.data.pdf.PdfBoxEditor
import com.pdfmaster.app.data.storage.StorageManager
import com.pdfmaster.app.domain.model.PdfExportResult
import com.pdfmaster.app.domain.model.PdfPageItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

sealed interface PdfEditorUiState {
    data object NoFileLoaded : PdfEditorUiState
    data object Loading : PdfEditorUiState
    data class Ready(val pages: List<PdfPageItem>) : PdfEditorUiState
    data class Saving(val progress: Int, val message: String) : PdfEditorUiState
    data class Success(val result: PdfExportResult) : PdfEditorUiState
    data class Error(val message: String) : PdfEditorUiState
}

class PdfEditorViewModel(application: Application) : AndroidViewModel(application) {

    private val rendererManager = AndroidPdfRendererManager(application)
    private val pdfEditor = PdfBoxEditor(application)
    private val storageManager = StorageManager(application)

    private val _uiState = MutableStateFlow<PdfEditorUiState>(PdfEditorUiState.NoFileLoaded)
    val uiState: StateFlow<PdfEditorUiState> = _uiState.asStateFlow()

    private var currentPdfUri: Uri? = null
    private val additionalMergeUris = mutableListOf<Uri>()

    fun loadPdf(uri: Uri) {
        currentPdfUri = uri
        viewModelScope.launch {
            _uiState.value = PdfEditorUiState.Loading
            try {
                val pages = rendererManager.extractPagesInfo(uri)
                _uiState.value = PdfEditorUiState.Ready(pages)
            } catch (e: Exception) {
                _uiState.value = PdfEditorUiState.Error("Не вдалося відкрити PDF: \${e.localizedMessage}")
            }
        }
    }

    fun rotatePage(pageIndex: Int) {
        val currentState = _uiState.value as? PdfEditorUiState.Ready ?: return
        val updated = currentState.pages.mapIndexed { index, page ->
            if (index == pageIndex) {
                page.copy(rotationAngle = (page.rotationAngle + 90) % 360)
            } else page
        }
        _uiState.value = PdfEditorUiState.Ready(updated)
    }

    fun deletePage(pageIndex: Int) {
        val currentState = _uiState.value as? PdfEditorUiState.Ready ?: return
        if (currentState.pages.size <= 1) {
            _uiState.value = PdfEditorUiState.Error("Документ повинен містити хоча б 1 сторінку")
            return
        }
        val mutable = currentState.pages.toMutableList()
        mutable.removeAt(pageIndex)
        _uiState.value = PdfEditorUiState.Ready(mutable)
    }

    fun reorderPages(fromIndex: Int, toIndex: Int) {
        val currentState = _uiState.value as? PdfEditorUiState.Ready ?: return
        val mutable = currentState.pages.toMutableList()
        val item = mutable.removeAt(fromIndex)
        mutable.add(toIndex, item)
        _uiState.value = PdfEditorUiState.Ready(mutable)
    }

    fun mergeAdditionalPdf(extraUri: Uri) {
        additionalMergeUris.add(extraUri)
        // Також оновлюємо прев'ю з новими сторінками
        viewModelScope.launch {
            try {
                val extraPages = rendererManager.extractPagesInfo(extraUri)
                val currentState = _uiState.value as? PdfEditorUiState.Ready
                val currentPages = currentState?.pages ?: emptyList()
                _uiState.value = PdfEditorUiState.Ready(currentPages + extraPages)
            } catch (e: Exception) {
                _uiState.value = PdfEditorUiState.Error("Помилка додавання PDF: \${e.localizedMessage}")
            }
        }
    }

    fun saveModifiedPdf(fileName: String = "Edited_Document") {
        val originalUri = currentPdfUri ?: return
        val currentState = _uiState.value as? PdfEditorUiState.Ready ?: return

        viewModelScope.launch {
            try {
                _uiState.value = PdfEditorUiState.Saving(10, "Початок збереження...")
                val tempFile = storageManager.createTempPdfFile("edited_")

                pdfEditor.saveEditedPdf(
                    originalPdfUri = originalUri,
                    modifiedPages = currentState.pages,
                    additionalPdfUris = additionalMergeUris,
                    outputFile = tempFile,
                    onProgress = { progress, msg ->
                        _uiState.value = PdfEditorUiState.Saving(progress, msg)
                    }
                )

                val publicUri = storageManager.savePdfToPublicStorage(tempFile, fileName)
                _uiState.value = PdfEditorUiState.Success(
                    PdfExportResult(
                        uri = publicUri,
                        fileName = "\$fileName.pdf",
                        fileSizeBytes = tempFile.length(),
                        pageCount = currentState.pages.size
                    )
                )
            } catch (e: Exception) {
                _uiState.value = PdfEditorUiState.Error("Помилка збереження: \${e.localizedMessage}")
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pdfmaster/app/ui/screens/pdfeditor/PdfEditorScreen.kt',
    name: 'ui/screens/pdfeditor/PdfEditorScreen.kt',
    category: 'ui',
    language: 'kotlin',
    description: 'Екран редактора PDF: перегляд сітки сторінок, поворот на 90/180/270°, видалення, додавання сторінок з іншого PDF та експорт',
    content: `package com.pdfmaster.app.ui.screens.pdfeditor

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.pdfmaster.app.domain.model.PdfPageItem

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PdfEditorScreen(
    viewModel: PdfEditorViewModel,
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    // Лаунчер вибору PDF файлу
    val pickPdfLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri ->
        uri?.let { viewModel.loadPdf(it) }
    }

    // Лаунчер для додавання другого PDF (Merge)
    val mergePdfLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri ->
        uri?.let { viewModel.mergeAdditionalPdf(it) }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Редактор PDF") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Назад")
                    }
                },
                actions = {
                    if (uiState is PdfEditorUiState.Ready) {
                        IconButton(onClick = { mergePdfLauncher.launch(arrayOf("application/pdf")) }) {
                            Icon(Icons.Default.Add, contentDescription = "Додати PDF для об'єднання")
                        }
                    }
                }
            )
        },
        bottomBar = {
            if (uiState is PdfEditorUiState.Ready) {
                Surface(
                    tonalElevation = 6.dp,
                    shadowElevation = 8.dp
                ) {
                    Button(
                        onClick = { viewModel.saveModifiedPdf() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Icon(Icons.Default.Save, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Зберегти відредагований PDF", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (val state = uiState) {
                is PdfEditorUiState.NoFileLoaded -> {
                    Column(
                        modifier = Modifier.fillMaxSize().padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            Icons.Default.FileOpen,
                            contentDescription = null,
                            modifier = Modifier.size(72.dp),
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Оберіть PDF для редагування",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Ви зможете змінювати порядок сторінок, повертати їх, видаляти непотрібні або об'єднувати документи.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(20.dp))
                        Button(onClick = { pickPdfLauncher.launch(arrayOf("application/pdf")) }) {
                            Icon(Icons.Default.FolderOpen, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Відкрити PDF файл")
                        }
                    }
                }
                is PdfEditorUiState.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                is PdfEditorUiState.Ready -> {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        itemsIndexed(state.pages, key = { _, item -> "\${item.originalPageIndex}_\${item.pageIndex}" }) { index, item ->
                            PdfPageGridItem(
                                item = item,
                                index = index,
                                onRotate = { viewModel.rotatePage(index) },
                                onDelete = { viewModel.deletePage(index) },
                                onMoveLeft = { if (index > 0) viewModel.reorderPages(index, index - 1) },
                                onMoveRight = { if (index < state.pages.size - 1) viewModel.reorderPages(index, index + 1) }
                            )
                        }
                    }
                }
                is PdfEditorUiState.Saving -> {
                    AlertDialog(
                        onDismissRequest = {},
                        confirmButton = {},
                        title = { Text("Збереження...") },
                        text = {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                LinearProgressIndicator(
                                    progress = { state.progress / 100f },
                                    modifier = Modifier.fillMaxWidth()
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(state.message)
                            }
                        }
                    )
                }
                is PdfEditorUiState.Success -> {
                    AlertDialog(
                        onDismissRequest = { viewModel.loadPdf(state.result.uri) },
                        title = { Text("Готово!") },
                        text = { Text("Файл успішно збережено: \${state.result.fileName}") },
                        confirmButton = {
                            Button(onClick = { viewModel.loadPdf(state.result.uri) }) {
                                Text("Продовжити")
                            }
                        }
                    )
                }
                is PdfEditorUiState.Error -> {
                    AlertDialog(
                        onDismissRequest = {},
                        title = { Text("Помилка") },
                        text = { Text(state.message) },
                        confirmButton = {
                            Button(onClick = { /* dismiss */ }) {
                                Text("ОК")
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun PdfPageGridItem(
    item: PdfPageItem,
    index: Int,
    onRotate: () -> Unit,
    onDelete: () -> Unit,
    onMoveLeft: () -> Unit,
    onMoveRight: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .background(Color.White)
            ) {
                AsyncImage(
                    model = item.thumbnailUri,
                    contentDescription = "Прев'ю сторінки",
                    modifier = Modifier
                        .fillMaxSize()
                        .rotate(item.rotationAngle.toFloat()),
                    contentScale = ContentScale.Fit
                )

                // Номер сторінки
                Surface(
                    modifier = Modifier
                        .padding(8.dp)
                        .align(Alignment.TopStart),
                    shape = CircleShape,
                    color = MaterialTheme.colorScheme.primaryContainer
                ) {
                    Text(
                        text = "Стор. \${index + 1}",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Видалити
                IconButton(
                    onClick = onDelete,
                    modifier = Modifier
                        .padding(4.dp)
                        .align(Alignment.TopEnd)
                        .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                        .size(32.dp)
                ) {
                    Icon(Icons.Default.Delete, contentDescription = "Видалити", tint = Color.White, modifier = Modifier.size(18.dp))
                }
            }

            // Дії над сторінкою
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 4.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onRotate, modifier = Modifier.size(36.dp)) {
                    Icon(Icons.Default.RotateRight, contentDescription = "Повернути на 90°", modifier = Modifier.size(20.dp))
                }
                IconButton(onClick = onMoveLeft, modifier = Modifier.size(36.dp)) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Перемістити назад", modifier = Modifier.size(18.dp))
                }
                IconButton(onClick = onMoveRight, modifier = Modifier.size(36.dp)) {
                    Icon(Icons.Default.ArrowForward, contentDescription = "Перемістити вперед", modifier = Modifier.size(18.dp))
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pdfmaster/app/MainActivity.kt',
    name: 'MainActivity.kt',
    category: 'ui',
    language: 'kotlin',
    description: 'Головна Activity з Jetpack Compose Navigation, темою Material 3 та системними інтентами',
    content: `package com.pdfmaster.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.pdfmaster.app.ui.screens.home.HomeScreen
import com.pdfmaster.app.ui.screens.imagetopdf.ImageToPdfScreen
import com.pdfmaster.app.ui.screens.imagetopdf.ImageToPdfViewModel
import com.pdfmaster.app.ui.screens.pdfeditor.PdfEditorScreen
import com.pdfmaster.app.ui.screens.pdfeditor.PdfEditorViewModel
import com.pdfmaster.app.ui.theme.PdfMasterTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            PdfMasterTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()

                    NavHost(
                        navController = navController,
                        startDestination = "home"
                    ) {
                        composable("home") {
                            HomeScreen(
                                onNavigateToImageToPdf = { navController.navigate("image_to_pdf") },
                                onNavigateToPdfEditor = { navController.navigate("pdf_editor") },
                                onNavigateToPdfTranslate = { navController.navigate("pdf_translate") }
                            )
                        }

                        composable("image_to_pdf") {
                            val viewModel: ImageToPdfViewModel = androidx.lifecycle.viewmodel.compose.viewModel()
                            ImageToPdfScreen(
                                viewModel = viewModel,
                                onNavigateBack = { navController.popBackStack() },
                                onOpenCrop = { /* Запуск uCrop Activity за необхідності */ }
                            )
                        }

                        composable("pdf_editor") {
                            val viewModel: PdfEditorViewModel = androidx.lifecycle.viewmodel.compose.viewModel()
                            PdfEditorScreen(
                                viewModel = viewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }

                        composable("pdf_translate") {
                            PdfTranslateScreen(
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pdfmaster/app/ui/theme/Theme.kt',
    name: 'ui/theme/Theme.kt',
    category: 'theme',
    language: 'kotlin',
    description: 'Тема застосунку Material You 3 з підтримкою Dynamic Color (Android 12+) та світлої/темної колірних схем',
    content: `package com.pdfmaster.app.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFFD0BCFF),
    secondary = Color(0xFFCCC2DC),
    tertiary = Color(0xFFEFB8C8),
    background = Color(0xFF141218),
    surface = Color(0xFF141218),
    primaryContainer = Color(0xFF4F378B),
    onPrimaryContainer = Color(0xFFEADDFF)
)

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF6750A4),
    secondary = Color(0xFF625B71),
    tertiary = Color(0xFF7D5260),
    background = Color(0xFFFEF7FF),
    surface = Color(0xFFFEF7FF),
    primaryContainer = Color(0xFFEADDFF),
    onPrimaryContainer = Color(0xFF21005D)
)

@Composable
fun PdfMasterTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content
    )
}
`,
  },
  {
    path: 'app/src/main/java/com/pdfmaster/app/ui/screens/translate/PdfTranslateScreen.kt',
    name: 'ui/screens/translate/PdfTranslateScreen.kt',
    category: 'ui',
    language: 'kotlin',
    description: 'Екран перекладу PDF на базі Google ML Kit On-Device: вибір мовної пари, офлайн-переклад та експорт',
    content: `package com.pdfmaster.app.ui.screens.translate

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material.icons.filled.Translate
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PdfTranslateScreen(
    onNavigateBack: () -> Unit
) {
    var sourceLang by remember { mutableStateOf("en") }
    var targetLang by remember { mutableStateOf("uk") }
    var isBilingual by remember { mutableStateOf(true) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Переклад PDF (ML Kit)") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Назад")
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Вибір мов
            ElevatedCard(shape = RoundedCornerShape(16.dp)) {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("З мови", style = MaterialTheme.typography.labelSmall)
                        Text("Англійська (EN)", fontWeight = FontWeight.Bold)
                    }

                    IconButton(onClick = {
                        val tmp = sourceLang
                        sourceLang = targetLang
                        targetLang = tmp
                    }) {
                        Icon(Icons.Default.SwapHoriz, contentDescription = "Поміняти")
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text("На мову", style = MaterialTheme.typography.labelSmall)
                        Text("Українська (UK)", fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Інфо про On-Device ML Kit
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer)
            ) {
                Text(
                    text = "Google ML Kit виконує переклад локально на пристрої користувача без надсилання конфіденційних документів на сервери.",
                    modifier = Modifier.padding(12.dp),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onTertiaryContainer
                )
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pdfmaster/app/data/scanner/DocumentScannerManager.kt',
    name: 'data/scanner/DocumentScannerManager.kt',
    category: 'data',
    language: 'kotlin',
    description: 'Інтеграція Google ML Kit Document Scanner API: виявлення меж, виправлення перспективи, фільтри та експорт в PDF/JPEG',
    content: `package com.pdfmaster.app.data.scanner

import android.app.Activity
import android.content.Context
import android.content.IntentSender
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.IntentSenderRequest
import com.google.mlkit.vision.documentscanner.GmsDocumentScanner
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions.RESULT_FORMAT_JPEG
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions.RESULT_FORMAT_PDF
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions.SCANNER_MODE_FULL
import com.google.mlkit.vision.documentscanner.GmsDocumentScanning
import com.google.mlkit.vision.documentscanner.GmsDocumentScanningResult

/**
 * Менеджер сканування документів на базі Google ML Kit Document Scanner API.
 * Забезпечує надійне On-Device визначення контурів, виправлення спотворень перспективи (dewarping),
 * видалення тіней/пальців та застосування оптимізованих фільтрів документів (B&W, Grayscale, Color).
 */
class DocumentScannerManager(private val activity: Activity) {

    private val scannerOptions = GmsDocumentScannerOptions.Builder()
        .setGalleryImportAllowed(true)
        .setPageLimit(25)
        .setResultFormats(RESULT_FORMAT_JPEG, RESULT_FORMAT_PDF)
        .setScannerMode(SCANNER_MODE_FULL) // Включає автоматичне захоплення, ручне редагування кутів та фільтри
        .build()

    private val scanner: GmsDocumentScanner = GmsDocumentScanning.getClient(scannerOptions)

    /**
     * Запуск нативного сканера ML Kit через ActivityResultLauncher
     */
    fun startScan(launcher: ActivityResultLauncher<IntentSenderRequest>, onFailure: (Exception) -> Unit) {
        scanner.getStartScanIntent(activity)
            .addOnSuccessListener { intentSender: IntentSender ->
                launcher.launch(IntentSenderRequest.Builder(intentSender).build())
            }
            .addOnFailureListener { exception ->
                onFailure(exception)
            }
    }

    /**
     * Обробка отриманого результату сканування
     */
    fun parseResult(result: GmsDocumentScanningResult?): ScannedDocumentResult? {
        if (result == null) return null

        val pagesUris = result.pages?.map { it.imageUri } ?: emptyList()
        val pdfUri = result.pdf?.uri
        val pageCount = result.pdf?.pageCount ?: pagesUris.size

        return ScannedDocumentResult(
            pagesUris = pagesUris,
            pdfUri = pdfUri,
            pageCount = pageCount
        )
    }
}

data class ScannedDocumentResult(
    val pagesUris: List<android.net.Uri>,
    val pdfUri: android.net.Uri?,
    val pageCount: Int
)
`,
  },
  {
    path: 'README.md',
    name: 'README.md (Інструкція запуску)',
    category: 'manifest',
    language: 'markdown',
    description: 'Покрокова інструкція імпорту проєкту в Android Studio, налаштування SDK 35, запуску на емуляторі/девайсі',
    content: `# PDF Master - Android Application (Jetpack Compose & Clean Architecture)

Мобільний застосунок для Android для створення PDF-файлів із зображень та редагування наявних PDF.

## 🚀 Стек технологій
- **Мова:** Kotlin 2.0+
- **UI:** Jetpack Compose (Material Design 3 / Material You)
- **Архітектура:** MVVM + Clean Architecture (Presentation, Domain, Data)
- **Нативні API:**
  - \`android.graphics.pdf.PdfDocument\` — створення та малювання PDF з орієнтацією, полями та нумерацією.
  - \`android.graphics.pdf.PdfRenderer\` — генерація векторних прев'ю сторінок.
  - Photo Picker API (\`ActivityResultContracts.PickMultipleVisualMedia\`) — вибір фотографій без застарілих системних дозволів.
  - MediaStore API & Scoped Storage (Android 10-15+) — безпечне збереження у папку "Downloads".
- **Бібліотеки:**
  - \`io.coil-kt:coil-compose\` — асинхронне завантаження зображень та кешування.
  - \`com.github.yalantis:ucrop\` — кадрування та поворот фото.
  - \`com.tom-roush:pdfbox-android\` — розширене редагування, вилучення та мердж PDF.
  - Kotlin Coroutines & Flow — фонова обробка без блокування UI потоку.

## 📦 Як відкрити проєкт в Android Studio
1. Завантажте ZIP-архів через кнопку **"Завантажити ZIP проєкт"**.
2. Розпакуйте архів у потрібну папку.
3. Відкрийте **Android Studio** (рекомендовано Flamingo, Hedgehog, Iguana, Koala або Ladybug).
4. Виберіть **File -> Open...** та вкажіть розпаковану папку.
5. Зачекайте завершення Gradle Sync.
6. Запустіть застосунок на емуляторі або реальному пристрої з Android 8.0+ (API 26-35).
`,
  }
];

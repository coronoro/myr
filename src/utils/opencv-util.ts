import cv, {Mat, Size} from "@techstark/opencv-js";
import Tesseract from "tesseract.js";

export function getContours(canvas: HTMLCanvasElement, output?: HTMLCanvasElement) {
    let img = cv.imread(canvas);

    let gray = new cv.Mat();
    cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY);

    let blur = new cv.Mat();
    cv.GaussianBlur(gray, blur, new Size(5, 5), 0)

    let thresh = new cv.Mat();
    const ret = cv.threshold(blur, thresh, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)

    let contours = new cv.MatVector();
    let hierarchies = new cv.Mat()
    cv.findContours(thresh, contours, hierarchies, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)

    // Find the contour
    var maxArea = -1;
    var maxContourIdx = -1;
    var aspectRatioThreshold = 16 / 9;

    // @ts-ignore
    for (var i = 0; i < contours.size(); i++) {
        var contour = contours.get(i);
        var area = cv.contourArea(contour);

        // Calculate bounding rectangle and aspect ratio of the contour
        var rect = cv.boundingRect(contour);
        var aspectRatio = rect.width / rect.height;

        // // Filter contours based on aspect ratio
        if (aspectRatio >= aspectRatioThreshold) {
            continue; // Skip contours that do not meet the aspect ratio criteria
        }

        if (area > maxArea) {
            maxArea = area;
            maxContourIdx = i;
        }
        // contour.delete(); // Release contour memory
    }

    // Crop the card from the original image using the contour
    const maxContour = contours.get(maxContourIdx)
    var card = cv.boundingRect(maxContour);
    var cropped = img.roi(card);

    // use to debug contours
    // alert(maxContourIdx)
    // let hierarchy = new cv.Mat();
    // // @ts-ignore
    // for (let i = 0; i < contours.size(); ++i) {
    //     if (i == maxContourIdx) {
    //         let color = new cv.Scalar(
    //             Math.floor(Math.random() * 256),
    //             Math.floor(Math.random() * 256),
    //             Math.floor(Math.random() * 256)
    //         );
    //         cv.drawContours(img, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
    //     }
    // }

    // Calculate the lower half of the cropped image
    let croppedHeight = cropped.rows;
    let lowerHalf = cropped.roi(new cv.Rect(0, croppedHeight / 2, cropped.cols, croppedHeight / 2));


    if (output) {
        // cv.imshow(output, cropped);
        cv.imshow(output, lowerHalf);
    }
}
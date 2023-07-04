import cv, {Mat, Size} from "@techstark/opencv-js";
import Tesseract from "tesseract.js";

export function cropIdentifier(input: HTMLCanvasElement, output?: HTMLCanvasElement){
    let img = cv.imread(input);
    const inputHeight = img.rows;
    const inputWidth = img.cols;
    const heightFractal = inputHeight / 8

    let lowerHalf = img.roi(new cv.Rect(0, heightFractal, inputWidth, heightFractal));
    if (output) {
        cv.imshow(output, lowerHalf);
    }
    img.delete()
    lowerHalf.delete()
}

export function cropCard(canvas: HTMLCanvasElement, output?: HTMLCanvasElement) {
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
    var card = cv.boundingRect(contours.get(maxContourIdx));
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

    if (output) {
        cv.imshow(output, cropped);
    }
    // clean memory
    img.delete()
    gray.delete()
    blur.delete()
    thresh.delete()
    contours.delete()
    hierarchies.delete()
    cropped.delete()
}
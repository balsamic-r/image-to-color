const getPixel = require("get-pixels");

const MAX_DEPTH = 4;
const IMAGE = "paris.jpg";


loadImage = function(image){
    return new Promise((resolve , rejecy) => {
        getPixel(image,(err,pixels) => {
            if(err) {
                reject(err);
            }
            resolve(toRgb(pixels));
        })
    });
}

toRgb = function(pixels){
    const width = pixels.shape[0];
    const height = pixels.shape[1];
    const rgb = [];
    for (let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++){
            const index = (y * width + x) * 4;
            rgb.push({
                r : pixels.data[index],
                g : pixels.data[index+1],
                b : pixels.data[index+2]
            });
        } 
    }
    return rgb;
}

findBiggestRagne = function(rgbArray){
    
    let rMin = Number.POSITIVE_INFINITY;
    let rMax = Number.NEGATIVE_INFINITY;

    let gMin = Number.POSITIVE_INFINITY;
    let gMax = Number.NEGATIVE_INFINITY;

    let bMin = Number.POSITIVE_INFINITY;
    let bMax = Number.NEGATIVE_INFINITY;

    rgbArray.forEach( pixel => {
        rMin = Math.min(rMin,pixel.r);
        rMax = Math.max(rMax,pixel.r);
        gMin = Math.min(gMin,pixel.g);
        gMax = Math.max(gMax,pixel.g);
        bMin = Math.min(bMin,pixel.b);
        bMax = Math.max(bMax,pixel.b);
        
    } );
    
    const rRange = rMax - rMin;
    const gRange = gMax - gMin;
    const bRange = bMax - bMin;

    const biggestRange = Math.max(rRange,gRange,bRange);
    
    if (biggestRange == rRange) {
        return 'r';
    } else if(biggestRange == gRange) {
        return 'g';
    } else if(biggestRange == bRange){
        return 'b';
    }

}

function medianCut(rgb, depth = 0, maxDepth = MAX_DEPTH){

    if(depth === maxDepth){
        const color = rgb.reduce((prev,curr) => {
            prev.r += curr.r;
            prev.g += curr.g;
            prev.b += curr.b;
            return prev;
        },{
            r : 0,
            g : 0,
            b : 0
        });

        color.r = Math.round(color.r / rgb.length);
        color.g = Math.round(color.g / rgb.length);
        color.b = Math.round(color.b / rgb.length);
        
        return [color];
    }

    const componentTosort = findBiggestRagne(rgb);
    
    rgb.sort((p1,p2) => {
        return p1[componentTosort] - p2[componentTosort];
    });

    const mid = rgb.length / 2;
    
    return [...medianCut(rgb.slice(0,mid) , depth + 1, maxDepth),
           ...medianCut(rgb.slice(mid + 1), depth + 1, maxDepth)];
}

orderColor = function(buckets){
    const  calcLuminance = p => {
        return 0.2126 * p.r + 0.7152 * p.g + 0.0722 * p.b;
    };

    return buckets.sort((p1,p2) => {
        return calcLuminance(p1) - calcLuminance(p2);
    });
}


loadImage(IMAGE)
.then(pixels => medianCut(pixels))
.then(buckets => orderColor(buckets))
.then(colors => {
    const fs = require("fs");
    const path = require("path");
    html = `
        <html>
            <head>
            <style>
                html , body { width:100%; height: 100%; margin:0; padding:0;}
                body {display:flex; flex-wrap: wrap;}
                .color {width:25%;heigth:25%}
            </style>
            </head>
            <body>
                ${colors.reduce((prev,color) => {
                    return prev + `<div 
                        class="color"
                        style="background-color: rgb(${color.r},${color.g},${color.b})"></div>`;
                }, '')}
            </body>
        </html>
    `;
    fs.writeFile(`${IMAGE}.html`,html);
})

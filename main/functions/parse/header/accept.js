module.exports = (acceptHeader, check) => {
    if (typeof acceptHeader != 'string')
        throw new Error(`Typeof acceptHeader (${acceptHeader}) is not string`)

    let arr = acceptHeader.split(',');
    let newArr = [];
    let isAll = false;
    let allQal = 1;

    arr.forEach(val => {
        if (isAll) return;
        if (val.split(';')[0] == '*/*') {
            isAll = true;
            if (val.split(';').length > 1)
                allQal = val.split(';')[1].split('q=')[1];
        }

        newArr.push({
            type: val.split(';')[0],
            quality:
                val.split(';').length > 1 ?
                    val.split(';')[1].split('q=')[1] :
                    1
        });
    });

    if (isAll)
        return { isIn: true, quality: allQal };

    let found = false;
    let quality;

    newArr.forEach(val => {
        if (found) return;

        if (val.type == check) {
            found = true;
            quality = val.quality
        }
    })

    if (found)
        return { isIn: true, quality }

    return { isIn: false }
}
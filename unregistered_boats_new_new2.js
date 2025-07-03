console.debug('STARTUP Get Unregistered Boats');
window.prodpicsPath = 'https://prodpics.s3.amazonaws.com/';

$('div[data-ref="' + 'PRODPICS/PRODPICS"]').empty();
$('button[data-ref="' + 'DOWNLOADS/DOWNLOADALL"]').hide();

dealerDropdown = $.parseJSON(decodeURIComponent(sessionStorage.arwing3)).DLR_DD;
if (dealerDropdown !== '') {
    ddButtons = '     <button id="filter_boats">Search</button>';
} else {
    ddButtons = '';
    var dlrno = window[profile].DEALER_NO;
    setValue('DLR', 'DLR_NO', dlrno);
    buildTable(dlrno, dlrno);
    bindSelect();
}

$('[data-ref="BOATS/DLRS"]').append(
    '<left>' +
    dealerDropdown + ddButtons +
    '</left>'
);

// Dealer Select / Search Button
$('#filter_boats').on('click', function () {
    var dlrno = Number($('#dealer_select').val());
    setValue('DLR', 'DLR_NO', dlrno);
    var dlrnoClean = dlrno;
    dlrno = pad(dlrno, 12);
    buildTable(dlrno, dlrnoClean);
    bindSelect();
});

function bindSelect() {
    $('#dealerBoats').on('click', '.selectBoat', function () {
        $('div[data-ref="' + 'PRODPICS/PRODPICS"]').empty();
        $('div[data-ref="BOATS/PRODPICSZIP"]').empty();
        $('button[data-ref="' + 'DOWNLOADS/DOWNLOADALL"]').hide();
        $('div[data-ref="OPTIONS/OPTIONS"]').children('div').remove();
        $('div[data-ref="SPECS/SPECS"]').children('div').remove();
        reset('PRICING');
        reset('BOAT_INFO');
        reset('DEALER_INSTALLED_OPTIONS');
        reset('DEALER_QUESTIONS');
        reset('DLR');
        if (dealerDropdown === '') {
            var dlrno = window[profile].DEALER_NO;
            setValue('DLR', 'DLR_NO', dlrno);
        } else {
            var dlrno = Number($('#dealer_select').val());
            setValue('DLR', 'DLR_NO', dlrno);
        }
        reset('DLR2');
        reset('PRINT_PHOTO');
        reset('MARGINS');
        reset('FREIGHTPREP');
        reset('EXTRAS');
        reset('SPECIAL_PRICING');
        reset('PRINT_SPECIAL_PRICE');
        window.SN = $(this).attr('id');
        console.log('Selected serial number is ' + SN);
        setValue('BOAT_INFO', 'HULL_NO', SN);
        setAnswer('FILTER', 'APPLIED');
        $('[class="nav sets nav-tabs"]:eq(0)').find('a:eq(1)').click();

        setAnswer('PRICING_TYPE', 'NO_PRICES');
        window.boattable = [];
        window.serial = getValue('BOAT_INFO', 'HULL_NO');
        window.freight = 0;
        window.prep = 0;

        loadPreviousSticker(serial);

        window.model_year = serial.substring(serial.length - 2);
        var snmRec = sStatement('SEL_ONE_SER_NO_MST', [serial]);
        var model = snmRec[0].BoatModelNo || snmRec[0].BoatDesc1;
        var snmInvoiceNo = snmRec[0].InvoiceNo;
        var boatinvoiceno = snmInvoiceNo;
        var engineRec = sStatement('SEL_ONE_ENG_SER_NO_MST', [serial]);

        if (engineRec.length > 0) {
            console.log('engineRec is ', engineRec);
            var engineERPNo = engineRec[0].ERP_OrderNo;
            var enginebrand = engineRec[0].EngineBrand;
        } else {
            var engineERPNo = '';
        }

        setValue('BOAT_INFO', 'BOAT_INVOICE_NO', boatinvoiceno);

        loadPackagePricing(model_year, serial, snmInvoiceNo, engineERPNo);
        console.log('boatoptions', window.boatoptions);

        if (model === "22GFSDN") { model = "22GFSAPGDN"; }
        if (model === "22GSDN") { model = "22GSAPGDN"; }

        setValue('DLR', 'PRC_TYPE', boatpricingtype);
        console.log('Engine Brand: ', enginebrand);

        if (enginebrand !== undefined && enginebrand.length > 0 && model.indexOf('IO') == -1) {
            if (enginebrand === 'MERCURY ENGINES' || enginebrand === 'MERCURY DB ENGIN' || enginebrand === 'MERCUR DB ENGIN' || enginebrand === '2B547667' || enginebrand === 'Mercury OB') { boatpkgitemno = 'MercPKG'; }
            else if (enginebrand === 'YAMAHA ENGINES' || enginebrand === 'YAMAHA ENGINE' || enginebrand === 'YAMAHA  DB ENGIN' || enginebrand === '63PX 1206969' || enginebrand === '63PX 1207669' || enginebrand === '63PX 1207662' || enginebrand === 'Yamaha OB') { boatpkgitemno = 'YamahaPKG'; }
            else if (enginebrand === 'HONDA ENGINES' || enginebrand === 'HONDA ENGINE' || enginebrand === 'ENGINE DB HONDA') { boatpkgitemno = 'HondaPKG'; }
            else if (enginebrand === 'SUZUKI ENGINES' || enginebrand === 'SUZUKI ENGINE' || enginebrand === 'DB SUZUKI ENGIN' || enginebrand === 'Suzuki OB') { boatpkgitemno = 'SuzukiPKG'; }
            else if (enginebrand === 'BOMBARDIER ENGINES' || enginebrand === 'EVINRUDE ENGINES' || enginebrand === 'EVINRUDE ENGINE' || enginebrand === 'Bombardier' || enginebrand === 'BMC ENGINES' || enginebrand === 'BOMB DB ENGIN') { boatpkgitemno = 'BombPKG'; }
            else if (enginebrand === 'TORQUEEDO ENGINES' || enginebrand === 'TORQUEEDO' || enginebrand === 'TORQEEDO' || enginebrand === 'TORQEEDO ENGINES' || enginebrand === 'ELECTRIC ENGINE') { boatpkgitemno = 'TorqPKG'; }
            else if (enginebrand === 'MINNKOTA ENGINES' || enginebrand === 'MINNKOTA') { boatpkgitemno = 'MinnKotaPKG'; }
            console.debug('boatpkgitemno is ', boatpkgitemno);
        }
        else if (model.indexOf('IO') > -1) {
            if (enginebrand === 'VOLVO I/O') { boatpkgitemno = model + 'V'; }
            else if (enginebrand === 'MERCURY I/O' || enginebrand === 'MERCRUISER I/O') {
                boatpkgitemno = model + 'M';
                console.log('Keri 128');
            }
            else {
                boatpkgitemno = '';
            }
        } else {
            boatpkgitemno = 'nopkg';
            console.debug('boatpkgitemno is ', boatpkgitemno);
        }

        console.log('boatpkgitemno is ', boatpkgitemno);
        console.log(model);
        window.pkgmsrp = '0';

        if (boatpricingtype !== 'REG' && model.indexOf('IO') == -1 && boatpkgitemno !== undefined) {
            var pkgmsrprec = $.grep(bpp, function (x) {
                return x.Model === model && x.Part === boatpkgitemno;
            });
            console.log('bpp', bpp, 'pkgmsrprec', pkgmsrprec);
        }
        if (boatpricingtype !== 'REG' && model.indexOf('IO') == -1 && boatpkgitemno !== undefined && pkgmsrprec.length > 0) {
            window.pkgmsrp = pkgmsrprec[0].price_MSRP;
        }
        if (pkgmsrp === undefined) { pkgmsrp = 0; }
        setValue('DLR', 'PKGMSRP', pkgmsrp);
        console.log('pkgmsrp', pkgmsrp);

        var priceLine = '';
        if (boatpricingtype == 'REG') { priceLine = 'REG'; }

        if (boatYear < 21) {
            if ((boatpricingtype === 'PP' || boatpricingtype === 'PPD' || boatpricingtype === 'SV') && pkgmsrp === 0) { priceLine = boatpricingtype + '_NO_MSRP'; }
            if ((boatpricingtype === 'PP' || boatpricingtype === 'PPD' || boatpricingtype === 'SV') && pkgmsrp !== 0) { priceLine = boatpricingtype + '_MSRP'; }
        } else {
            priceLine = boatpricingtype;
        }

        var PriceDescLine = $.grep(priceDesc, function (x) { return x.TYPE == 'LONG_DESC'; });
        var sPriceLine = $.grep(priceDesc, function (z) { return z.TYPE == 'SALE'; });
        var msPriceLine = $.grep(priceDesc, function (y) { return y.TYPE == 'MSRP'; });
        console.log('priceDesc', priceDesc, 'sPriceLine', sPriceLine, 'msPriceLine', msPriceLine, 'PriceDescLine', PriceDescLine);
        if (sPriceLine.length > 0 && msPriceLine.length > 0 && PriceDescLine.length > 0) {
            setValue('PRC_DESC', 'PRC_DESC_SALE', sPriceLine[0][priceLine] || '');
            setValue('PRC_DESC', 'PRC_DESC_MSRP', msPriceLine[0][priceLine] || '');
            setValue('PRC_DESC', 'PTYPE_DESC', PriceDescLine[0][priceLine] || '');
            changeLabel('PRC_DESC', 'PRC_DESC_SALE', sPriceLine[0][priceLine] || '');
            changeLabel('PRC_DESC', 'PRC_DESC_MSRP', msPriceLine[0][priceLine] || '');
            changeLabel('PRC_DESC', 'PTYPE_DESC', PriceDescLine[0][priceLine] || '');
        }

        window.realmodel = model;
        model = model.replace(/\d+/g, '');

        console.log('series', series);
        setValue('DLR', 'SERIES', series);

        if (previoussticker.length === 0) {
            applyDealerMargins();
        }

        var engineinvoiceno = "";
        var perfpkgpartno = "";
        if (window.boatoptions) {
            var perfPkg = $.grep(boatoptions, function (x) {
                return x.MCTDesc === 'TUBE UPGRADES' || x.ItemDesc1.includes('Performance') || x.ItemNo.includes('Performance');
            });
            if (perfPkg.length > 0) {
                perfpkgpartno = perfPkg[0].ItemDesc1 || perfPkg[0].ItemNo;
            }
        }

        // Mapping for getUdpByPart and Calculate2021
        var perfPkgMap = {
            'Performance Tube': '4',
            // Add other descriptive ItemNo to PerfPkgID mappings
            'Triple Tube Package': '1',
            'Sport Tube': '2',
            'Performance Package Plus': '12',
            'High Performance Tube': '16',
            'Standard Tube Upgrade': '11'
        };

        if (serialYear < 21) {
            Calculate();
        } else {
            Calculate2021();
        }

        setValue('BOAT_INFO', 'BOAT_MODEL', realmodel.substring(0, realmodel.length - 2));
        setValue('BOAT_INFO', 'BOAT_REAL_MODEL', realmodel);
        setValue('BOAT_INFO', 'HULL_NO', serial);
        setValue('BOAT_INFO', 'BOAT_INVOICE_NO', boatinvoiceno);
        setValue('BOAT_INFO', 'ENG_INVOICE_NO', engineinvoiceno);
        setValue('BOAT_INFO', 'PERF_PKG_ON_BOAT', perfpkgpartno);
        $('input[data-ref="BOAT_INFO/BOAT_MODEL"]').attr('readonly', 'true');
        $('input[data-ref="BOAT_INFO/BOAT_REAL_MODEL"]').attr('readonly', 'true');
        $('input[data-ref="BOAT_INFO/HULL_NO"]').attr('readonly', 'true');
        $('input[data-ref="BOAT_INFO/BOAT_INVOICE_NO"]').attr('readonly', 'true');
        $('input[data-ref="BOAT_INFO/ENG_INVOICE_NO"]').attr('readonly', 'true');
        $('input[data-ref="BOAT_INFO/STD_PERF_PKG"]').attr('readonly', 'true');
        $('input[data-ref="BOAT_INFO/PERF_PKG_ON_BOAT"]').attr('readonly', 'true');
        $('input[data-ref="DEALER_QUESTIONS/PHOTO_URL"]').attr('readonly', 'true');
        $('input[data-ref="DEALER_INSTALLED_OPTIONS/DIO_TOTAL"]').attr('readonly', 'true');

        console.log(stndsMtrx);
        if (perfpkgpartno === "") {
            console.log('no perf pkg on this boat');
            window.defaultperfpkgid = "";
            if (typeof stndsMtrx !== 'undefined') {
                $.each(stndsMtrx, function (j) {
                    var part = stndsMtrx[j].STANDARD;
                    var partId = perfPkgMap[part] || part; // Use mapping or fallback
                    if (partId === 'Performance Tube') { defaultperfpkgid = '4'; }
                    else if (partId === 'Triple Tube Package') { defaultperfpkgid = '1'; }
                    else if (partId === 'Sport Tube') { defaultperfpkgid = '2'; }
                    else if (partId === 'Performance Package Plus') { defaultperfpkgid = '12'; }
                    else if (partId === 'High Performance Tube') { defaultperfpkgid = '16'; }
                    else if (partId === 'Standard Tube Upgrade') { defaultperfpkgid = '11'; }
                });
            }
            setValue('BOAT_INFO', 'STD_PERF_PKG', defaultperfpkgid);
        } else {
            var defaultperfpkgidonboat = perfPkgMap[perfpkgpartno] || getUdpByPart(boatproductid, perfpkgpartno, 'PerfPkgID');
            if (defaultperfpkgidonboat === null || defaultperfpkgidonboat === undefined) {
                defaultperfpkgidonboat = perfPkgMap[perfpkgpartno] || getUdpByPart('568974f2a9d29adf3e5ecfce', perfpkgpartno, 'PerfPkgID') || '';
            }
            setValue('BOAT_INFO', 'STD_PERF_PKG', defaultperfpkgidonboat);
        }

        console.log('boattable', boattable);
        $('#included').remove();
        GenerateBoatTable(boattable);
    });
}

function buildTable(dlrno, dlrnoClean) {
    data = sStatement('WS_GET_UNREG_BOATS', [pad(dlrno, 12), dlrnoClean, pad(dlrnoClean, 8)]);
    for (var i in data) { SerNumberHasImages(data[i]['Boat_SerialNo'], data[i]['SerialModelYear'], data[i]['ProdNo']); }

    console.log('boats', data);

    var boat_table =
        '<table id="dealerBoats" border="1" style="width: 100%" cellpadding="4" cellspacing="1">' +
        '<thead>' +
        '   <tr>' +
        '       <td>Boat Serial Number</td>' +
        '       <td>Boat Model</td>' +
        '       <td>Panel Color</td>' +
        '       <td>Accent Panel</td>' +
        '       <td>Actions</td>' +
        '       <td></td>' +
        '   </tr>' +
        '   <tr>' +
        '       <td><input type="text" value="" width: 100px;></td>' +
        '       <td><input type="text" value="" width: 100px;></td>' +
        '       <td><input type="text" value="" width: 100px;></td>' +
        '       <td><input type="text" value="" width: 100px;></td>' +
        '       <td><input type="text" value="" width: 100px;></td>' +
        '       <td></td>' +
        '   </tr></thead><tbody>';

    for (var i in data) {
        boat_table +=
            '<tr>' +
            '<td>' + data[i]['Boat_SerialNo'] + '</td>' +
            '<td>' + data[i]['BoatDesc1'] + (data[i]['ProdNo'] ? ' (' + data[i]['ProdNo'] + ')' : '') + '</td>' +
            '<td>' + data[i]['PanelColor'] + '</td>' +
            '<td>' + data[i]['AccentPanel'] + '</td>' +
            '<td style="text-align: center">' +
            '<span>' +
            '<a id="' + data[i]['Boat_SerialNo'] + '" href="#" class="selectBoat">' +
            '<span style="color: blue">[Select ' + data[i]['Boat_SerialNo'] + ']</span></a> </td>' +
            '<td><div id="hasProductionImages_' + data[i]['Boat_SerialNo'] + '"></div></td>' +
            '</tr>';
    }

    boat_table += '</tbody></table>';

    $('div[data-ref="BOATS/UNREG"]').children('div').remove();
    $('div[data-ref="BOATS/UNREG"]').append(boat_table);
    LoopCheckImagesArray();

    $('#dealerBoats').dataTable({
        "bSortCellsTop": true,
    });

    var table = $('#dealerBoats').DataTable();
    $('#dealerBoats td input').each(function (i, el) {
        console.log(i, el);
        var col = table.column(i);
        $(el).on('keyup change', function () {
            if (col.search() !== this.value) {
                col.search(this.value).draw();
            }
        });
    });

    $.each($('.text_filter'), function () {
        $(this).attr('class', 'text_filter search_init input-small');
    });

    $('#dealerBoats').on('draw.dt', function () {
        LoopCheckImagesArray();
    });
}

$('[class="btn btn-attach-upload btn-small btn-primary"]').attr('id', 'upload');

$('#upload').on('click', function () {
    getUpload();
});

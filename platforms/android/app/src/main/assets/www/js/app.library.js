var appLib = {
    timer: '',

    IsNullOrEmpty: function (paramValue) {
        if (paramValue == '' || paramValue == undefined || paramValue == null) {
            return true;
        }
        else {
            return false;
        }
    },

    replaceAll: function (paramValue, paramFind, paramReplace) {
        returnValue = paramValue;

        if (!appLib.IsNullOrEmpty(paramValue))
            returnValue = paramValue.toString().split(paramFind).join(paramReplace);

        return returnValue;
    },

    htmlEncode: function (paramValue) {
        return $('<div/>').text(paramValue).html();
    },

    htmlDecode: function (paramValue) {
        return $('<div/>').html(paramValue).text();
    },

    focusToEnd: function (paramSeletor) {
        $(paramSeletor).focus();
        var thisValue = $(paramSeletor).val();
        $(paramSeletor).val('');
        $(paramSeletor).val(thisValue);
    },

    bandMessage: function (paramType, paramMessage, paramTimeout) {
        if (window.plugins && window.plugins.toast) {
            window.plugins.toast.hide();
            window.plugins.toast.showWithOptions({
                message: paramMessage,
                duration: paramTimeout ? paramTimeout : 'long',
                position: 'bottom',
                addPixelsY: -40
            }, function () { }, function () { });
        }
        else {
            $('#bandMessage').hide();
            clearTimeout(this.timer);

            if ($('#bandMessage').length < 1)
                $('body').append('<div id="bandMessage" class="band-message"></div>');

            if ($('#bandMessage .message-wrapper')) {
                $('#bandMessage').html('<div class="message-wrapper alert alert-' + paramType + ' alert-dismissible">'
                    + '    <span class="message"></span>'
                    + '    <button type="button" class="close" data-dismiss="alert">&times;</button>'
                    + '</div>');
            }

            $('#bandMessage .message').text(paramMessage);
            $('#bandMessage').stop().fadeIn(210);

            if (paramTimeout > 0) {
                this.timer = setTimeout(function () {
                    $('#bandMessage').stop().fadeOut(500);
                }, paramTimeout);
            }
        }
    },

    numberFormat: function (value) {
        var val = (value / 1).toFixed(0).replace('.', ',');
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    },

    now: function (day) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);

        if (day !== undefined)
            today.setDate(day);

        return this.dateFormat(today);
    },

    nowTime: function () {
        var date = new Date();
        var pad2 = function (n) {
            return n < 10 ? '0' + n : n;
        };

        return date.getFullYear().toString() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate()) + '_' + pad2(date.getHours()) + '-' + pad2(date.getMinutes()) + '-' + pad2(date.getSeconds());
    },

    renew: function (val) {
        return JSON.parse(JSON.stringify(val));
    },

    dateFormat: function (date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    },

    addDay: function (date, day) {
        var d = new Date(date);

        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + day);

        return this.dateFormat(d);
    },

    addMonth: function (date, month) {
        var d = new Date(date);

        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        d.setMonth(d.getMonth() + month);

        return this.dateFormat(d);
    },

    getLatestDates: function (d) {
        var returnValue = [];

        d.setDate(d.getDate() - 1);
        returnValue.push(appLib.dateFormat(d));
        d.setDate(d.getDate() + 1);
        returnValue.push(appLib.dateFormat(d));
        d.setDate(d.getDate() + 1);
        returnValue.push(appLib.dateFormat(d));

        return returnValue;
    },

    getLatestMonths: function (d, num) {
        var returnValue = [];

        d.setDate(1);
        d.setMonth(d.getMonth() - num);
        returnValue.push(appLib.dateFormat(d));

        for (var i = 0; i < num * 2; i += 1) {
            d.setMonth(d.getMonth() + 1);
            returnValue.push(appLib.dateFormat(d));
        }

        return returnValue;
    },

    getNumberDate: function (d) {
        var date = this.replaceAll(d, '-', '');
        return Number(date);
    },

    getLastDayOfMonth: function (d) {
        var date = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        return date.getDate();
    }
}
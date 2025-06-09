var app = new Vue({
    el: '#app',
    data: {
        temp: {
            mode: 'record',
            nav: {
                visible: false
            },
            modal: {
                type: 'add',
                sequence: 0,
                record: {
                    idx: 0,
                    date: appLib.now(),
                    selectedDate: '',
                    category: '',
                    bank: '',
                    io: 'out',
                    money: null,
                    memo: null,
                    isFinished: null
                },
                kind: {
                    idx: 0,
                    value: '',
                    columns: [],
                    useFinished: false,
                    dday: 0
                },
                category: {
                    u: 0,
                    value: ''
                },
                bank: {
                    u: 0,
                    value: ''
                },
                loadable: false,
                deletable: false,
                history: '',
                histories: [],
                box: null
            },
            swiper: null,
            exitCheck: false,
            timer: {},
            record: {
                month: appLib.now(1),
                months: [],
                monthTotal: appLib.getLatestMonths(new Date(), 36),
                selected: {
                    category: '',
                    bank: '',
                    io: ''
                },
                any: true,
                result: {
                    carried: 0,
                    income: 0,
                    outcome: 0,
                    dayRemain: 0,
                    dayVisibleRemain: 0,
                    totalRemain: 0
                }
            },
            backup: {
                backup: {
                    idx: '',
                    data: ''
                },
                restore: {
                    idx: '',
                    data: ''
                }
            },
            eximport: {
                exportPath: '',
                import: '',
                imports: []
            }
        },
        private: {
            theme: 'navy',
            themes: ['navy'],
            idx: 0
        },
        protected: [{
            name: '기본 재정',
            columns: ['category', 'memo'],
            useFinished: false,
            records: {},
            categories: [],
            banks: [],
            dday: 0,
            sequence: 0
        }]
    },
    watch: {},
    methods: {
        go: function (hash) {
            if (!hash) {
                location.hash = '';
                return;
            }

            if (location.hash === '#' + hash)
                hash += '/';

            location.hash = hash;
        },
        get: function (act, val1, val2) {
            var t = this;

            switch (act) {
                case 'sequence':
                    t.protected[t.private.idx].sequence += 1;
                    t.set('storage', 'protected', JSON.stringify(t.protected));
                    return t.protected[t.private.idx].sequence;

                case 'number':
                    if (!val1) {
                        return val1;
                    }
                    else {
                        var val = (val1 / 1).toFixed(0).replace('.', ',');
                        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }

                case 'byte':
                    var size = 0;
                    var data = null;

                    switch (val1) {
                        case 'each':
                            data = JSON.stringify(t.protected[t.private.idx]);
                            break;

                        case 'backup':
                            data = t.temp.backup.backup.data;
                            break;

                        case 'restore':
                            data = t.temp.backup.restore.data;
                            break;

                        default:
                            return '0Byte';
                    }

                    if (!data)
                        return '0Byte';

                    for (var idx = 0; idx < data.length; idx++) {
                        var ch = escape(data.charAt(idx));

                        if (ch.length == 1)
                            size++;
                        else if (ch.indexOf("%u") != -1)
                            size += 2;
                        else if (ch.indexOf("%") != -1)
                            size += ch.length / 3;
                    }

                    if (size < 1024) return size + 'Bytes';
                    else if (size < 1048576) return (size / 1024).toFixed(2) + 'KB';
                    else if (size < 1073741824) return (size / 1048576).toFixed(2) + 'MB';
                    else return (size / 1073741824).toFixed(2) + 'GB';

                case 'dday':
                    var d = new Date();
                    var day = d.getDate();
                    var dday = Number(t.protected[t.private.idx].dday);
                    var gap = null;
                    var lastDay = appLib.getLastDayOfMonth(d);

                    if (dday > lastDay)
                        dday = lastDay;

                    if (day < dday) {
                        gap = dday - day;
                    }
                    else if (day === dday) {
                        gap = 'Day';
                    }
                    else {
                        var nextDate = new Date(d.getFullYear(), d.getMonth() + 1, dday);
                        var gapTime = 0;
                        d.setHours(0, 0, 0);
                        nextDate.setHours(0, 0, 0);
                        gapTime = Math.abs(nextDate.getTime() - d.getTime());
                        gap = Math.ceil(gapTime / (1000 * 3600 * 24));
                    }

                    return 'D-' + gap;

                case 'backup':
                    break;
            }
        },
        set: function (act, val1, val2) {
            switch (act) {
                case 'storage':
                    localStorage.setItem(val1, val2);
                    break;

                case 'data':
                    try {
                        var data = JSON.parse(val1);

                        if (typeof data !== 'object') {
                            return false;
                        }

                        if (this.temp.backup.restore.idx !== '') {
                            if (Array.isArray(data)) {
                                return false;
                            }

                            this.protected[this.temp.backup.restore.idx] = data;
                        }
                        else {
                            if (!Array.isArray(data))
                                this.protected.push(data);
                            else
                                this.protected = data;
                        }

                        for (var i in this.protected) {
                            if (!this.private.themes[i])
                                this.private.themes[i] = 'navy';
                        }

                        if (this.temp.backup.backup.idx !== '')
                            this.temp.backup.backup.data = JSON.stringify(this.protected[this.temp.backup.backup.idx]);
                        else
                            this.temp.backup.backup.data = JSON.stringify(this.protected);

                        this.set('storage', 'private', JSON.stringify(this.private));
                        this.set('storage', 'protected', JSON.stringify(this.protected));

                        return true;
                    }
                    catch (e) { }

                    return false;
            }
        },
        mode: function (act, val1, val2) {
            switch (act) {
                case 'get':
                    switch (val1) {
                        case 'name':
                            switch (val2) {
                                case 'record':
                                    return '재정 관리';

                                case 'kind':
                                    return '종류 설정';

                                case 'category':
                                    return '분류 설정';

                                case 'bank':
                                    return '은행 설정';

                                case 'theme':
                                    return '테마 설정';

                                case 'backup':
                                    return '백업/복원';

                                case 'eximport':
                                    return '내보내기/가져오기';
                            }
                            break;

                        case 'ico':
                            switch (val2) {
                                case 'record':
                                    return 'krw';

                                case 'kind':
                                    return 'list-alt';

                                case 'category':
                                    return 'thumb-tack';

                                case 'bank':
                                    return 'bold';

                                case 'theme':
                                    return 'window-maximize';

                                case 'backup':
                                    return 'refresh';

                                case 'eximport':
                                    return 'download';
                            }
                            break;
                    }

                    break;
                case 'set':
                    this.temp.mode = val1;
                    this.nav('close');
                    break;
            }
        },
        nav: function (act) {
            switch (act) {
                case 'open':
                    this.temp.nav.visible = true;
                    break;

                case 'close':
                    this.temp.nav.visible = false;
                    break;
            }
        },
        modal: function (act, type, val1, val2) {
            var t = this;
            switch (act) {
                case 'visible':
                    return $('#appModal').hasClass('show');
                    return

                case 'open':
                    var inputType = 'text';
                    t.temp.modal.loadable = false;
                    t.temp.modal.histories = [];

                    switch (type) {
                        case 'add':
                            t.temp.modal.type = type;
                            t.temp.modal.loadable = true;
                            t.temp.modal.deletable = false;

                            switch (t.temp.mode) {
                                case 'record':
                                    t.temp.modal.record.idx = 0;
                                    t.temp.modal.record.category = '';
                                    t.temp.modal.record.bank = '';
                                    t.temp.modal.record.money = null;
                                    t.temp.modal.record.memo = null;
                                    t.temp.modal.record.isFinished = null;
                                    inputType = 'number';

                                    $('#recordDate').datepicker({
                                        onSelect: function (d) { t.temp.modal.record.date = d; }
                                    });
                                    break;

                                case 'kind':
                                    t.temp.modal.kind.value = '';
                                    t.temp.modal.kind.columns = ['category', 'memo'];
                                    t.temp.modal.kind.useFinished = false;
                                    t.temp.modal.kind.dday = 0;
                                    break;

                                case 'category':
                                    t.temp.modal.sequence = t.get('sequence');
                                    t.temp.modal.category.value = '';
                                    break;

                                case 'bank':
                                    t.temp.modal.sequence = t.get('sequence');
                                    t.temp.modal.bank.value = '';
                                    break;
                            }

                            $('#appModal').on('shown.bs.modal', function () {
                                $(this).find('input[type=' + inputType + ']:visible').focus();
                            });
                            break;

                        case 'edit':
                            t.temp.modal.type = type;
                            t.temp.modal.deletable = true;

                            switch (t.temp.mode) {
                                case 'record':
                                    var value = t.protected[t.private.idx].records[t.temp.record.month][val1][val2];

                                    if (!value) {
                                        appLib.bandMessage('danger', '오류가 있습니다.', 0);
                                        return;
                                    }

                                    t.temp.modal.record = {
                                        date: val1,
                                        selectedDate: val1,
                                        idx: val2,
                                        category: value.category,
                                        bank: value.bank,
                                        io: value.io,
                                        money: value.money,
                                        memo: value.memo,
                                        isFinished: value.isFinished
                                    };

                                    $('#recordDate').datepicker({
                                        onSelect: function (d) { t.temp.modal.record.date = d; }
                                    });

                                    $('#appModal').off('shown.bs.modal');
                                    break;

                                case 'kind':
                                    t.temp.modal.kind = {
                                        idx: val1,
                                        value: t.protected[val1].name,
                                        columns: t.protected[val1].columns,
                                        useFinished: t.protected[val1].useFinished,
                                        dday: t.protected[val1].dday ? t.protected[val1].dday : 0
                                    };

                                    $('#appModal').off('shown.bs.modal');
                                    break;

                                case 'category':
                                    var category = t.category('get', val1);

                                    if (!category) {
                                        appLib.bandMessage('danger', '오류가 있습니다.', 0);
                                        return;
                                    }

                                    t.temp.modal.category = {
                                        u: category.u,
                                        value: category.value
                                    }

                                    $('#appModal').on('shown.bs.modal', function () {
                                        $(this).find('input[type=text]').focus();
                                    });
                                    break;

                                case 'bank':
                                    var bank = t.bank('get', val1);

                                    if (!bank) {
                                        appLib.bandMessage('danger', '오류가 있습니다.', 0);
                                        return;
                                    }

                                    t.temp.modal.bank = {
                                        u: bank.u,
                                        value: bank.value
                                    }

                                    $('#appModal').on('shown.bs.modal', function () {
                                        $(this).find('input[type=text]').focus();
                                    });
                                    break;
                            }
                            break;

                        default:
                            appLib.bandMessage('danger', '오류가 있습니다.', 0);
                            return;
                    }

                    $('#appModal').modal('show');
                    break;

                case 'close':
                    $('#appModal').modal('hide');
                    break;

                case 'save':
                    switch (t.temp.mode) {
                        case 'record':
                            if (!t.temp.modal.record.money) {
                                appLib.bandMessage('warning', '금액을 입력해주세요.', 2000);
                                $('#appModal input[type=number]:visible').focus();
                                return;
                            }
                            else if (!Number(t.temp.modal.record.money)) {
                                appLib.bandMessage('warning', '금액 값을 확인해주세요.', 2000);
                                $('#appModal input[type=number]:visible').focus();
                                return;
                            }

                            var money = Number(t.temp.modal.record.money);

                            switch (t.temp.modal.type) {
                                case 'add': {
                                    var month = appLib.dateFormat(new Date(t.temp.modal.record.date).setDate(1));

                                    if (!t.protected[t.private.idx].records[month])
                                        t.protected[t.private.idx].records[month] = {};

                                    if (!t.protected[t.private.idx].records[month][t.temp.modal.record.date])
                                        t.protected[t.private.idx].records[month][t.temp.modal.record.date] = [];

                                    t.protected[t.private.idx].records[month][t.temp.modal.record.date].push({
                                        category: t.temp.modal.record.category,
                                        bank: t.temp.modal.record.bank,
                                        io: t.temp.modal.record.io,
                                        money: money,
                                        memo: t.temp.modal.record.memo,
                                        isFinished: t.temp.modal.record.isFinished,
                                        visible: true
                                    });
                                    break;
                                }

                                case 'edit': {
                                    var date = $('#recordDate').val();
                                    var month = appLib.dateFormat(new Date(date).setDate(1));
                                    var value = t.protected[t.private.idx].records[t.temp.record.month][t.temp.modal.record.selectedDate][t.temp.modal.record.idx];

                                    if (!value) {
                                        appLib.bandMessage('danger', '오류가 있습니다.', 0);
                                        return;
                                    }

                                    value.category = t.temp.modal.record.category;
                                    value.bank = t.temp.modal.record.bank;
                                    value.io = t.temp.modal.record.io;
                                    value.money = money;
                                    value.memo = t.temp.modal.record.memo;
                                    value.isFinished = t.temp.modal.record.isFinished;
                                    value.visible = true;

                                    if (date !== t.temp.modal.record.selectedDate) {
                                        if (!t.protected[t.private.idx].records[month])
                                            t.protected[t.private.idx].records[month] = {};

                                        if (!t.protected[t.private.idx].records[month][date])
                                            t.protected[t.private.idx].records[month][date] = [];

                                        t.protected[t.private.idx].records[month][date].push(value);
                                        t.protected[t.private.idx].records[t.temp.record.month][t.temp.modal.record.selectedDate].splice(t.temp.modal.record.idx, 1);
                                    }

                                    if (!t.protected[t.private.idx].records[t.temp.record.month][t.temp.modal.record.selectedDate].length)
                                        delete t.protected[t.private.idx].records[t.temp.record.month][t.temp.modal.record.selectedDate];
                                    break;
                                }

                                default: {
                                    appLib.bandMessage('danger', '오류가 있습니다.', 0);
                                    return;
                                }
                            }

                            t.set('storage', 'protected', JSON.stringify(t.protected));
                            t.record('update');
                            break;

                        case 'kind':
                            if (!t.temp.modal.kind.value) {
                                appLib.bandMessage('warning', '종류명을 입력해주세요.', 2000);
                                $('#appModal input[type=text]:visible').focus();
                                return;
                            }
                            else if (t.temp.modal.kind.dday < 0 || t.temp.modal.kind.dday > 31) {
                                appLib.bandMessage('warning', '입력하신 D-Day 값이 올바르지 않습니다.', 2000);
                                return;
                            }

                            switch (t.temp.modal.type) {
                                case 'add':
                                    t.private.themes[t.protected.length] = t.private.theme;
                                    t.protected.push({
                                        name: t.temp.modal.kind.value,
                                        columns: t.temp.modal.kind.columns,
                                        useFinished: t.temp.modal.kind.useFinished,
                                        records: {},
                                        categories: [],
                                        banks: [],
                                        dday: Number(t.temp.modal.kind.dday),
                                        sequence: 0
                                    });
                                    break;

                                case 'edit':
                                    t.protected[t.temp.modal.kind.idx].name = t.temp.modal.kind.value;
                                    t.protected[t.temp.modal.kind.idx].columns = t.temp.modal.kind.columns;
                                    t.protected[t.temp.modal.kind.idx].useFinished = t.temp.modal.kind.useFinished;
                                    t.protected[t.temp.modal.kind.idx].dday = Number(t.temp.modal.kind.dday);
                                    break;

                                default:
                                    appLib.bandMessage('danger', '오류가 있습니다.', 0);
                                    return;
                            }

                            t.set('storage', 'private', JSON.stringify(t.private));
                            t.set('storage', 'protected', JSON.stringify(t.protected));
                            break;

                        case 'category':
                            if (!t.temp.modal.category.value) {
                                appLib.bandMessage('warning', '분류명을 입력해주세요.', 2000);
                                $('#appModal input[type=text]:visible').focus();
                                return;
                            }

                            switch (t.temp.modal.type) {
                                case 'add':
                                    t.protected[t.private.idx].categories.push({
                                        u: t.temp.modal.sequence,
                                        value: t.temp.modal.category.value
                                    });
                                    break;

                                case 'edit':
                                    var category = t.category('get', t.temp.modal.category.u);

                                    if (!category) {
                                        appLib.bandMessage('danger', '오류가 있습니다.', 0);
                                        return;
                                    }

                                    category.value = t.temp.modal.category.value;
                                    break;

                                default:
                                    appLib.bandMessage('danger', '오류가 있습니다.', 0);
                                    return;
                            }

                            t.set('storage', 'protected', JSON.stringify(t.protected));
                            break;

                        case 'bank':
                            if (!t.temp.modal.bank.value) {
                                appLib.bandMessage('warning', '은행명을 입력해주세요.', 2000);
                                $('#appModal input[type=text]:visible').focus();
                                return;
                            }

                            switch (t.temp.modal.type) {
                                case 'add':
                                    t.protected[t.private.idx].banks.push({
                                        u: t.temp.modal.sequence,
                                        value: t.temp.modal.bank.value
                                    });
                                    break;

                                case 'edit':
                                    var bank = t.bank('get', t.temp.modal.bank.u);

                                    if (!bank) {
                                        appLib.bandMessage('danger', '오류가 있습니다.', 0);
                                        return;
                                    }

                                    bank.value = t.temp.modal.bank.value;
                                    break;

                                default:
                                    appLib.bandMessage('danger', '오류가 있습니다.', 0);
                                    return;
                            }

                            t.set('storage', 'protected', JSON.stringify(t.protected));
                            break;
                    }

                    t.modal('close');
                    appLib.bandMessage('success', '저장하였습니다.', 3000);
                    break;

                case 'show':
                    switch (type) {
                        case 'load':
                            if (t.temp.modal.histories.length) {
                                t.temp.modal.histories = [];
                            }
                            else {
                                for (var r in t.protected[t.private.idx].records) {
                                    var records = t.protected[t.private.idx].records[r];

                                    for (var d in records)
                                        t.temp.modal.histories.push(d);
                                }

                                if (!t.temp.modal.histories.length)
                                    appLib.bandMessage('warning', '데이터가 없습니다.', 2000);
                            }
                            break;
                    }
                    break;

                case 'load':
                    var date = t.temp.modal.record.date;

                    if (t.temp.modal.history && confirm('선택하신 날짜의 데이터를 가져오시겠습니까?\n' + t.temp.modal.history + ' --> ' + date)) {
                        var historyMonth = appLib.dateFormat(new Date(t.temp.modal.history).setDate(1));
                        var records = appLib.renew(t.protected[t.private.idx].records[historyMonth][t.temp.modal.history]);
                        var month = appLib.dateFormat(new Date(t.temp.modal.record.date).setDate(1));

                        if (!t.protected[t.private.idx].records[month])
                            t.protected[t.private.idx].records[month] = {};

                        if (!t.protected[t.private.idx].records[month][date])
                            t.protected[t.private.idx].records[month][date] = [];

                        for (var i in records) {
                            if (records[i].isFinished)
                                records[i].isFinished = false;

                            t.protected[t.private.idx].records[month][date].push(records[i]);
                        }

                        t.modal('close');
                        t.set('storage', 'protected', JSON.stringify(t.protected));
                        t.record('update');
                        appLib.bandMessage('success', '데이터를 가져왔습니다.', 3000);
                    }

                    t.temp.modal.history = '';
                    break;

                case 'delete':
                    if (confirm('삭제하시겠습니까?')) {
                        switch (t.temp.mode) {
                            case 'record':
                                var month = appLib.dateFormat(new Date(t.temp.modal.record.date).setDate(1));
                                var protected = t.protected[t.private.idx].records[month];
                                var record = protected[t.temp.modal.record.date];
                                var value = record[t.temp.modal.record.idx];

                                if (!value) {
                                    appLib.bandMessage('danger', '오류가 있습니다.', 0);
                                    return;
                                }

                                record.splice(t.temp.modal.record.idx, 1);

                                if (!t.protected[t.private.idx].records[month][t.temp.modal.record.date].length)
                                    delete t.protected[t.private.idx].records[month][t.temp.modal.record.date];

                                t.set('storage', 'protected', JSON.stringify(t.protected));
                                t.record('update');
                                break;

                            case 'kind':
                                t.protected.splice(t.temp.modal.kind.idx, 1);

                                if (t.temp.modal.kind.idx < t.private.idx)
                                    t.private.idx -= 1;

                                if (t.private.themes[t.temp.modal.kind.idx])
                                    t.private.themes.splice(t.temp.modal.kind.idx, 1);

                                t.set('storage', 'private', JSON.stringify(t.private));
                                t.set('storage', 'protected', JSON.stringify(t.protected));
                                break;

                            case 'category':
                                for (var i in t.protected[t.private.idx].categories) {
                                    if (t.protected[t.private.idx].categories[i].u === t.temp.modal.category.u) {
                                        t.protected[t.private.idx].categories.splice(i, 1)
                                        break;
                                    }
                                }

                                t.set('storage', 'protected', JSON.stringify(t.protected));
                                break;

                            case 'bank':
                                for (var i in t.protected[t.private.idx].banks) {
                                    if (t.protected[t.private.idx].banks[i].u === t.temp.modal.bank.u) {
                                        t.protected[t.private.idx].banks.splice(i, 1)
                                        break;
                                    }
                                }

                                t.set('storage', 'protected', JSON.stringify(t.protected));
                                break;
                        }

                        appLib.bandMessage('success', '삭제하였습니다.', 3000);
                        t.modal('close');
                    }
                    break;
            }
        },
        date: function (act, t) {
            switch (act) {
                case 'toggle':
                    if ($('#recordDate').datepicker('widget').is(':visible'))
                        $('#recordDate').datepicker('hide');
                    else
                        $('#recordDate').datepicker('show');
                    break;
            }
        },
        record: function (act, val1, val2) {
            var t = this;

            switch (act) {
                case 'calc':
                    var carried = 0;
                    var income = 0;
                    var outcome = 0;
                    var visibleIncome = 0;
                    var visibleOutcom = 0;
                    var remain = 0;
                    var thisDate = appLib.getNumberDate(t.temp.record.month);
                    var thisYear = thisDate.toString().substring(0, 4);
                    var thisMinDate = Number(thisYear + '0101');
                    var thisMaxDate = Number(thisYear + '1231');

                    for (var d in t.protected[t.private.idx].records) {
                        for (var i in t.protected[t.private.idx].records[d]) {
                            var records = t.protected[t.private.idx].records[d][i];
                            var recordDate = appLib.getNumberDate(d);

                            if (recordDate < thisDate && recordDate >= thisMinDate && recordDate <= thisMaxDate) {
                                for (var i in records)
                                    carried += (records[i].money * (records[i].io === 'in' ? 1 : -1));
                            }
                            else if (recordDate === thisDate) {
                                for (var i in records) {
                                    if (records[i].visible) {
                                        if (records[i].io === 'in')
                                            visibleIncome += Number(records[i].money);
                                        else
                                            visibleOutcom += Number(records[i].money);
                                    }

                                    if (records[i].io === 'in')
                                        income += Number(records[i].money);
                                    else
                                        outcome += Number(records[i].money);
                                }
                            }
                        }
                    }

                    remain = income - outcome;
                    t.temp.record.result.carried = carried;
                    t.temp.record.result.income = income;
                    t.temp.record.result.outcome = outcome;
                    t.temp.record.result.dayRemain = remain;
                    t.temp.record.result.dayVisibleRemain = visibleIncome - visibleOutcom;
                    t.temp.record.result.totalRemain = carried + remain;
                    break;

                case 'toggle':
                    t.temp.modal.record.io = (t.temp.modal.record.io === 'in' ? 'out' : 'in');
                    break;

                case 'change':
                    t.set('storage', 'private', JSON.stringify(this.private));
                    location.href = '';
                    break;

                case 'update':
                    var records = t.protected[t.private.idx].records[t.temp.record.month];
                    var category = t.temp.record.selected.category;
                    var bank = t.temp.record.selected.bank;
                    var io = t.temp.record.selected.io;
                    t.temp.record.any = false;

                    for (var i in records) {
                        for (var j in records[i]) {
                            records[i][j].visible = false;

                            if ((!category || records[i][j].category === category) && (!bank || records[i][j].bank === bank) && (!io || records[i][j].io === io)) {
                                records[i][j].visible = true;
                                t.temp.record.any = true;
                            }
                        }
                    }

                    t.record('calc');

                    t.$nextTick(function () {
                        $('#app.record .each-data').each(function () {
                            if (!$(this).find('.value').length)
                                $(this).hide();
                            else
                                $(this).show();
                        });
                    });
                    break;

                case 'delete':
                    if (confirm('선택하신 날짜(' + val2 + ')의 데이터를 삭제하시겠습니까?')) {
                        var monthRecords = this.protected[this.private.idx].records[val1];
                        var dayRecords = monthRecords[val2];

                        for (var i = dayRecords.length - 1; i >= 0; --i) {
                            if (dayRecords[i].visible)
                                dayRecords.splice(i, 1);
                        }

                        if (dayRecords.length === 0)
                            delete monthRecords[val2];

                        this.record('update');
                        this.set('storage', 'protected', JSON.stringify(t.protected));

                        appLib.bandMessage('success', '삭제하였습니다.', 2000);
                    }
                    break;

                case 'order':
                    var returnValue = {};

                    switch (val1) {
                        case 'key':
                            var key, a = [];

                            for (key in val2) {
                                if (val2.hasOwnProperty(key))
                                    a.push(key);
                            }

                            a.sort();

                            for (key = 0; key < a.length; key++)
                                returnValue[a[key]] = val2[a[key]];
                            break;

                        case 'io':
                            returnValue = [];

                            for (var i in val2) {
                                if (val2[i].io === 'in')
                                    returnValue.push(val2[i]);
                            }

                            for (var i in val2) {
                                if (val2[i].io !== 'in')
                                    returnValue.push(val2[i]);
                            }
                            break;
                    }

                    return returnValue;

                case 'set':
                    switch (val1) {
                        case 'date':
                            t.temp.record.months = appLib.getLatestMonths(new Date(val2), 1);
                            t.temp.record.month = t.temp.record.months[1];

                            if (t.temp.record.monthTotal.indexOf(t.temp.record.months[1]) === 0)
                                t.temp.record.monthTotal.unshift(t.temp.record.months[0]);
                            else if (t.temp.record.monthTotal.indexOf(t.temp.record.months[1]) === t.temp.record.monthTotal.length - 1)
                                t.temp.record.monthTotal.push(t.temp.record.months[2]);

                            t.record('update');
                            t.temp.swiper.update();
                            t.temp.swiper.slideTo(1, 0);
                            t.temp.modal.record.date = t.temp.record.month;
                            break;

                        case 'record':
                            if (t.temp.modal.record[val2] === 'add') {
                                t.temp.modal.box = bootbox.prompt({
                                    title: '값을 입력해주세요.',
                                    backdrop: true,
                                    buttons: {
                                        confirm: {
                                            label: '저장하기',
                                            className: 'btn-primary save-btn'
                                        },
                                        cancel: {
                                            label: '닫기',
                                            className: 'btn-secondary'
                                        }
                                    },
                                    callback: function (newVal) {
                                        if (!newVal) {
                                            t.temp.modal.record[val2] = '';
                                        }
                                        else {
                                            var target = '';
                                            var storage = '';
                                            var unique = t.get('sequence');

                                            switch (val2) {
                                                case 'category':
                                                    target = t.protected[t.private.idx].categories;
                                                    storage = 'categories';
                                                    break;

                                                case 'bank':
                                                    target = t.protected[t.private.idx].banks;
                                                    storage = 'banks';
                                                    break;

                                                default:
                                                    return;
                                            }

                                            target.push({
                                                u: unique,
                                                value: newVal
                                            });

                                            t.temp.modal.record[val2] = unique;
                                            t.set('storage', 'protected', JSON.stringify(t.protected));

                                            appLib.bandMessage('success', '추가하였습니다.', 2000);
                                        }
                                    }
                                });
                            }
                            break;
                    }
                    break;

                default:
                    t.temp.mode = 'record';
                    t.nav('close');
                    t.modal('close');
                    t.record('update');
                    break;
            }
        },
        kind: function (act, val1) {
            switch (act) {
                case 'apply':
                    this.private.idx = val1;
                    this.set('storage', 'private', JSON.stringify(this.private));
                    $('#app').hide().fadeIn(500);
                    appLib.bandMessage('success', '적용하였습니다.', 2000);
                    location.hash = '';
                    break;

                default:
                    this.temp.mode = 'kind';
                    this.nav('close');
                    this.modal('close');
                    break;
            }
        },
        category: function (act, val1, val2) {
            switch (act) {
                case 'get':
                    switch (val1) {
                        case 'name':
                            if (!val2)
                                return '-';

                            var category;
                            var categories = this.protected[this.private.idx].categories;

                            for (var i in categories) {
                                if (categories[i].u === val2) {
                                    category = categories[i];
                                    break;
                                }
                            }

                            if (category)
                                return category.value;
                            else
                                return '?';
                            break;

                        default:
                            for (var i in this.protected[this.private.idx].categories) {
                                if (this.protected[this.private.idx].categories[i].u === val1)
                                    return this.protected[this.private.idx].categories[i];
                            }

                            return null;
                    }
                    break;

                default:
                    this.temp.mode = 'category';
                    this.nav('close');
                    this.modal('close');
                    break;
            }
        },
        bank: function (act, val1, val2) {
            switch (act) {
                case 'get':
                    switch (val1) {
                        case 'name':
                            if (!val2)
                                return '-';

                            var bank = this.bank('get', val2);

                            if (bank)
                                return bank.value;
                            else
                                return '?';
                            break;

                        default:
                            for (var i in this.protected[this.private.idx].banks) {
                                if (this.protected[this.private.idx].banks[i].u === val1)
                                    return this.protected[this.private.idx].banks[i];
                            }
                            return null;
                    }
                    break;

                default:
                    this.temp.mode = 'bank';
                    this.nav('close');
                    this.modal('close');
                    break;
            }
        },
        theme: function (act, val1) {
            switch (act) {
                case 'set':
                    this.private.theme = val1;
                    this.private.themes[this.private.idx] = val1;
                    this.set('storage', 'private', JSON.stringify(this.private));

                    $('#app').hide().fadeIn(500);
                    appLib.bandMessage('success', '적용하였습니다.', 2000);
                    location.hash = '';
                    break;

                case 'get':
                    if (this.private.themes[this.private.idx])
                        return this.private.themes[this.private.idx];

                    return this.private.theme;

                default:
                    this.temp.mode = 'theme';
                    this.nav('close');
                    this.modal('close');
                    break;
            }
        },
        refresh: function () {
            location.reload();
        },
        hash: function (act) {
            switch (act) {
                case 'change':
                    var hash = appLib.replaceAll(location.hash, '#', '');
                    var arr = hash.split('/')
                    var act = arr[0];
                    var param1 = arr[1];
                    var param2 = arr[2];
                    var param3 = arr[3];
                    var backArr = ['modal', 'nav'];

                    if (!act)
                        this.record();
                    else if (param1 !== undefined && param2 !== undefined && param3 !== undefined)
                        this[act](param1, param2, param3);
                    else if (param1 !== undefined && param2 !== undefined)
                        this[act](param1, param2);
                    else if (param1 !== undefined)
                        this[act](param1);
                    else
                        this[act]();
                    break;
            };
        },
        backup: function (act, val1) {
            switch (act) {
                case 'copy':
                    $('#backupContent').select();
                    document.execCommand("copy");
                    appLib.bandMessage('success', '복사하였습니다.', 2000);
                    break;

                case 'restore':
                    var content = this.temp.backup.restore.data;

                    if (!content) {
                        appLib.bandMessage('warning', '데이터를 입력해주세요.', 2000);
                        $('#backupContent').focus();
                        return;
                    }

                    if (this.set('data', content))
                        appLib.bandMessage('success', '데이터를 복원하였습니다.', 2000);
                    else
                        appLib.bandMessage('warning', '입력하신 값이 유효하지 않습니다.', 2000);
                    break;

                case 'change':
                    switch (val1) {
                        case 'backup':
                            var backupData = this.backupData;

                            if (this.temp.backup.backup.idx !== '')
                                this.temp.backup.backup.data = JSON.stringify(backupData[this.temp.backup.backup.idx]);
                            else
                                this.temp.backup.backup.data = JSON.stringify(backupData);
                            break;
                    }
                    break;

                default:
                    this.temp.backup.backup.idx = '';
                    this.temp.backup.restore.data = '';
                    this.temp.mode = 'backup';
                    this.nav('close');
                    this.modal('close');
                    this.temp.backup.backup.data = JSON.stringify(this.backupData);
                    break;
            }
        },
        eximport: function (act) {
            var t = this;

            switch (act) {
                case 'export':
                    if (window.cordova) {
                        var nowTime = appLib.nowTime();
                        var fileName = 'backup_' + nowTime + '.json';

                        window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, function (dirEntry1) {
                            dirEntry1.getDirectory('backups', { create: true }, function (dirEntry2) {
                                dirEntry2.getFile(fileName, { create: true }, function (fileEntry) {
                                    fileEntry.createWriter(function (fileWriter) {
                                        var blob;

                                        fileWriter.onwriteend = function (e) {
                                            var path = '/Android/data/org.africalib.finance/backups/' + fileName;
                                            appLib.bandMessage('success', '내보내기를 완료하였습니다.', 3000);
                                            t.temp.eximport.exportPath = path;
                                            t.eximport('imports');
                                        };

                                        fileWriter.onerror = function (e) {
                                            appLib.bandMessage('danger', '오류가 있습니다.#2', 0);
                                        };

                                        blob = new Blob([JSON.stringify(t.backupData)], { type: 'text/plain' });
                                        fileWriter.write(blob);
                                    }, function () {
                                        appLib.bandMessage('danger', '오류가 있습니다.#1', 0);
                                    });
                                });
                            });
                        });
                    }
                    break;

                case 'import':
                    if (window.cordova) {
                        var fileName = t.temp.eximport.import;

                        if (confirm('선택하신 데이터(' + fileName + ')를 가져오시겠습니까?')) {
                            window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, function (dirEntry1) {
                                dirEntry1.getDirectory('backups', { create: true }, function (dirEntry2) {
                                    dirEntry2.getFile(fileName, {}, function (fileEntry) {
                                        var reader = new FileReader();
                                        fileEntry.file(function (file) {
                                            reader.onloadend = function () {
                                                if (t.set('data', this.result))
                                                    appLib.bandMessage('success', '가져오기를 완료하였습니다.', 3000);
                                                else
                                                    appLib.bandMessage('warning', '입력하신 값이 유효하지 않습니다.', 2000);
                                            };
                                            reader.readAsText(file);
                                        });
                                    }, function (err) {
                                        appLib.bandMessage('danger', '오류가 있습니다.#1', 0);
                                    });
                                });
                            });
                        }

                        t.temp.eximport.import = '';
                    }
                    break;

                case 'imports':
                    if (window.cordova) {
                        t.temp.eximport.imports = [];

                        window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, function (dirEntry1) {
                            dirEntry1.getDirectory('backups', { create: true }, function (dirEntry2) {
                                var reader = dirEntry2.createReader();
                                reader.readEntries(
                                    function (entries) {
                                        for (var i in entries) {
                                            if (entries[i].isFile && entries[i].name.indexOf('.json') > 0)
                                                t.temp.eximport.imports.push(entries[i].name);
                                        }
                                    },
                                    function (err) {
                                        appLib.bandMessage('danger', '오류가 있습니다.#2', 0);
                                    }
                                );
                            }, function (err) {
                                appLib.bandMessage('danger', '오류가 있습니다.#1', 0);
                            });
                        });
                    }
                    break;

                default:
                    this.temp.mode = 'eximport';
                    this.nav('close');
                    this.modal('close');
                    t.eximport('imports');
                    t.temp.eximport.exportPath = '';
                    break;
            }
        }
    },
    computed: {
        backupData: function () {
            var backupData = appLib.renew(this.protected);

            for (var i in backupData) {
                for (j in backupData[i].records) {
                    for (var k in backupData[i].records[j]) {
                        for (l in backupData[i].records[j][k]) {
                            backupData[i].records[j][k][l].visible = true;
                        }
                    }
                }
            }

            return backupData;
        },
        categories: function () {
            function compare(a, b) {
                if (a.value < b.value)
                    return -1;
                if (a.value > b.value)
                    return 1;
                return 0;
            }

            return this.protected[this.private.idx].categories.sort(compare);
        },
        banks: function () {
            function compare(a, b) {
                if (a.value < b.value)
                    return -1;
                if (a.value > b.value)
                    return 1;
                return 0;
            }

            return this.protected[this.private.idx].banks.sort(compare);
        },
        now: function () {
            return appLib.now();
        }
    },
    created: function () {
        var t = this;

        var data = {
            private: appLib.renew(t.private),
            protected: appLib.renew(t.protected)
        };

        var d = new Date();
        d.setHours(0, 0, 0, 0);
        t.temp.record.months = appLib.getLatestMonths(d, 1);

        t.private = localStorage.getItem('private');
        t.protected = localStorage.getItem('protected');

        if (t.private)
            t.private = JSON.parse(t.private);
        else
            t.private = data.private

        if (!t.private.themes)
            t.private.themes = ['navy'];

        if (t.protected)
            t.protected = JSON.parse(t.protected);
        else
            t.protected = data.protected;

        // 이름 변경. 2018-10-03
        for (var i in t.protected) {
            if (t.protected[i].useCompleted !== undefined) {
                t.protected[i]['useFinished'] = t.protected[i].useCompleted ? true : false;
                delete t.protected[i].useCompleted;
            }
        }

        $(document).on('click', '.date-prev', function () {
            t.temp.swiper.slideTo(t.temp.swiper.activeIndex - 1);
        });

        $(document).on('click', '.date-next', function () {
            t.temp.swiper.slideTo(t.temp.swiper.activeIndex + 1);
        });

        $(document).on('click', '#bandMessage', function () {
            t.temp.exitCheck = false;
        });

        $(window).on('hashchange', function () {
            t.hash('change');
        });

        t.$nextTick(function () {
            var dates = [];
            var isBeginning = false;

            t.temp.swiper = new Swiper('.swiper-container');
            t.temp.swiper.slideTo(1, 0);

            t.temp.swiper.on('reachEnd', function () {
                var lastIdx = t.temp.record.months.length - 1;
                var date = appLib.addMonth(t.temp.record.months[lastIdx], 1);
                t.temp.record.months.push(date);

                if (t.temp.record.monthTotal.indexOf(date) < 0)
                    t.temp.record.monthTotal.push(date);

                t.$nextTick(function () {
                    t.temp.swiper.update();
                    t.temp.record.month = t.temp.record.months[t.temp.swiper.activeIndex];
                });
            });

            t.temp.swiper.on('reachBeginning', function () {
                var lastIdx = t.temp.record.months.length - 1;
                var date = appLib.addMonth(t.temp.record.months[0], -1);
                t.temp.record.months.unshift(date);
                isBeginning = true;

                if (t.temp.record.monthTotal.indexOf(date) < 0)
                    t.temp.record.monthTotal.unshift(date);

                t.$nextTick(function () {
                    t.temp.swiper.update();
                });
            });

            t.temp.swiper.on('transitionEnd', function () {
                t.$nextTick(function () {
                    if (isBeginning) {
                        t.temp.swiper.slideTo(1, 0, false);
                        isBeginning = false;
                    }

                    t.temp.record.month = t.temp.record.months[t.temp.swiper.activeIndex];
                    t.temp.modal.record.date = t.temp.record.month;
                    t.record('update');
                });
            });

            t.hash('change');
            t.record('update');
        });

        document.addEventListener('deviceready', function () {
            document.addEventListener('backbutton', function () {
                var hash = appLib.replaceAll(location.hash, '#', '');
                var homeArr = ['', 'record'];

                if (t.temp.nav.visible) {
                    t.temp.nav.visible = false;
                }
                else if ($('#recordDate').datepicker('widget').is(':visible')) {
                    $('#recordDate').blur().datepicker('hide');
                }
                else if (t.modal('visible')) {
                    t.modal('close');
                    t.temp.modal.box.modal('hide');
                }
                else if (homeArr.indexOf(hash) >= 0) {
                    clearTimeout(t.temp.timer['exit']);

                    if (!t.temp.exitCheck) {
                        appLib.bandMessage('warning', '한번 더 누르시면 종료합니다.', 2000);
                        t.temp.exitCheck = true;

                        t.temp.timer['exit'] = setTimeout(function () {
                            t.temp.exitCheck = false;
                        }, 2000);
                    }
                    else {
                        navigator.app.exitApp();
                    }
                }
                else {
                    navigator.app.backHistory();
                }
            }, false);
        }, false);
    }
});
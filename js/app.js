$(document).ready(function () {

    'use strict';

    $('body').css('padding-top', $('header').outerHeight());

    $('.second-nav a').on('click touch', function (e) {
        e.preventDefault();
        $('.second-nav a').parent().removeClass('active');
        $(this).parent().addClass('active');
    });

    var loadLeagues = true;
    var loadLegueTable = true;

    var $appBox = $('.app-box');
    var $introScreen = '<section class="intro-screen"><h1>Football Results</h1><p>Please select league:</p></section>';
    var $leagueScreen = '<section class="league-screen"><div class="select-league"></div></section>';
    var $tableData = '<section class="table-data"><div class="table"></div></section>';
    var $tableHeader = '<div class="table-header"><div></div><div>P</div><div>W</div><div>D</div><div>L</div><div>GD</div><div>Pts</div></div>';

    function tableScreen() {
        // load leagues

        if (document.cookie && document.cookie.indexOf('LoadLeagues=1') != -1) {

            loadLeagues = false;
            console.log('cookie');

        } else {

            console.log('cookie expired');
            loadLeagues = true;

        };

        if ((localStorage.getItem('Leagues') !== null) && (!loadLeagues)) {

            $('.league-name').html('');

            // insert into text and leagues list
            $appBox.html($introScreen + $leagueScreen);

            console.log('use localstorage - table screen');

            // retrive response from localstorage
            var appData = JSON.parse(localStorage.getItem('Leagues'));

            $.each(appData, function (index) {
                var name = appData[index].caption;
                var link = appData[index]._links.leagueTable.href;
                var leagueName = appData[index].league;

                $('.select-league').append('<a href="#" data-table-url="' + link + '" data-table-pref="' + leagueName + '">' + name + '</a>');

            });


        } else {
            $.ajax({
                headers: {
                    'X-Auth-Token': 'ad36d94a3eaf4dcf802b05c867b5e9e6'
                },
                url: 'https://api.football-data.org/v1/competitions',
                dataType: 'json',
                type: 'GET',
                success: function (response) {

                    $('.league-name').html('');

                    // insert into text and leagues list
                    $appBox.html($introScreen + $leagueScreen);

                    // save response to localstorage
                    var appData = JSON.stringify(response);
                    localStorage.setItem('Leagues', appData);
                    var appData = JSON.parse(localStorage.getItem('Leagues'));

                    console.log('use ajax - table screen');

                    $.each(appData, function (index) {
                        var name = appData[index].caption;
                        var link = appData[index]._links.leagueTable.href;
                        var leagueName = appData[index].league;

                        $('.select-league').append('<a href="#" data-table-url="' + link + '" data-table-pref="' + leagueName + '">' + name + '</a>');

                    });

                    var now = new Date();
                    var exp = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

                    document.cookie = 'LoadLeagues=1; expires=' + exp.toUTCString() + ' path=/;';
                },
                beforeSend: function () {

                    $('.app-box').addClass('overlay');
                    $('.app-box').append('<div class="overlay-box"><div class="loader"><svg viewBox="0 0 32 32" width="32" height="32"><circle id="spinner" cx="16" cy="16" r="14" fill="none"></circle></svg></div></div>')

                },
                complete: function () {

                    $('.app-box').removeClass('overlay');
                    $('.overlay-box').remove();
                },
                error: function () {
                    $('.app-box').hide();
                    $('body').append('<section class="offline"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i><h3>API server is offline :(</h3></section>');
                }

            });
        };
    };



    var dataTableUrl = '',
        dataTablePref = '';

    function showTableData() {


        if (document.cookie && document.cookie.indexOf('load-table-' + dataTablePref + '=1') != -1) {
            
            console.log('cookie present');
            loadLegueTable = false;
            

        } else {

            console.log('cookie expired');
            loadLegueTable = true;

        };


        $appBox.html($tableData);

        if ((localStorage.getItem(dataTablePref) !== null) && (!loadLegueTable)) {

            console.log('use localstorage - build table');

            buildTable();

        } else {
            runAjaxCall();
        };

    };

    $('body').on('click touch', '.select-league a', function () {
        dataTableUrl = $(this).data('table-url');
        dataTablePref = $(this).data('table-pref');

        showTableData();
    });

    function showHideMenu() {
        $('.page-overlay').toggle();
        $('.side-menu').toggleClass('open');
    };

    $('.menu-button').on('click touch', function () {
        showHideMenu()
    });

    $('.page-overlay').on('click touch', function () {
        showHideMenu()
    });

    $('.table-button').on('click touch', function (e) {
        e.preventDefault();

        tableScreen();

        showHideMenu();
        $('.update-table').css('display', 'none');

        if ($('body').hasClass('offline-page')) {
            e.stopPropagation();
            document.location.href = "/";
        };
    });

    function buildTable() {
        // clear table
        $('.table').html('');

        // retrive response from localstorage
        var appData = JSON.parse(localStorage.getItem(dataTablePref));

        // update league name           
        $('.league-name').html(appData.leagueCaption);

        // build league table
        $.each(appData.standing, function (index) {
            var name = appData.standing[index].teamName,
                logo = appData.standing[index].crestURI,
                gamesPlayed = appData.standing[index].playedGames,
                gamesWin = appData.standing[index].wins,
                gamesLost = appData.standing[index].losses,
                gamesDraw = appData.standing[index].draws,
                totalPoints = appData.standing[index].points,
                goalDifference = appData.standing[index].goalDifference;

            if (logo === "null") {
                logo = '/images/default.png';
            };

            $('.table').append('<div class="row"><div class="logo"><img src="' + logo + '"></div><div class="team-name">' + name + '</div><div>' + gamesPlayed + '</div><div>' + gamesWin + '</div><div>' + gamesDraw + '</div><div>' + gamesLost + '</div><div>' + goalDifference + '</div><div>' + totalPoints + '</div></div>');

        });

        $('.update-table').css('display', 'flex');
    };

    function runAjaxCall() {
        $.ajax({
            headers: {
                'X-Auth-Token': 'ad36d94a3eaf4dcf802b05c867b5e9e6'
            },
            url: dataTableUrl,
            dataType: 'json',
            type: 'GET',
            success: function (response) {
                // save response to localstorage
                var appData = JSON.stringify(response);
                localStorage.setItem(dataTablePref, appData);

                console.log('use ajax - build table');

                buildTable();

                var now = new Date();
                var exp = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

                document.cookie = 'load-table-' + dataTablePref + '=1; expires=' + exp.toUTCString() + ' path=/;';

            },
            beforeSend: function () {

                $('.table-data').addClass('overlay');
                $('.table-data').append('<div class="overlay-box"><div class="loader"><svg viewBox="0 0 32 32" width="32" height="32"><circle id="spinner" cx="16" cy="16" r="14" fill="none"></circle></svg></div></div>')

            },
            complete: function () {

                $('.table-data').removeClass('overlay');
                $('.overlay-box').remove();

            },
            error: function () {
                console.error('error ajax call');
            }

        });
    };

    $('.update-table').on('click touch', function (e) {
        e.preventDefault();
        runAjaxCall();
    });

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('service-worker.js')
            .then(function () {
                console.log('Service Worker Registered');
            });
    };
});
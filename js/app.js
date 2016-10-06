$(document).ready(function () {

    'use strict';

    var offsetHeight = $('header').outerHeight();

    $('body').css('padding-top', offsetHeight);
    $('body').css('height', 'calc(100% - ' + offsetHeight + 'px)');

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
    var $fixtures = '<div class="day"><ul></ul></div><div class="day-playes"></div>';

    function tableScreen() {
        // load leagues

        if (document.cookie && document.cookie.indexOf('LoadLeagues=1') != -1) {
            loadLeagues = false;
        } else {
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
                var leagueFixture = appData[index]._links.fixtures.href;

                $('.select-league').append('<a href="#" data-table-url="' + link + '" data-table-pref="' + leagueName + '" data-fixture-url="' + leagueFixture + '">' + name + '</a>');
                $('.league-list').append('<a href="#" data-table-url="' + link + '" data-table-pref="' + leagueName + '" data-fixture-url="' + leagueFixture + '">' + name + '</a>');
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
                        var leagueFixture = appData[index]._links.fixtures.href;
                        var leagueName = appData[index].league;

                        $('.select-league').append('<a href="#" data-table-url="' + link + '" data-table-pref="' + leagueName + '" data-fixture-url="' + leagueFixture + '">' + name + '</a>');
                        $('.league-list').append('<a href="#" data-table-url="' + link + '" data-table-pref="' + leagueName + '" data-fixture-url="' + leagueFixture + '">' + name + '</a>');

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
                    $('.app-box').html('<section class="offline"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i><h3>API server is offline :(</h3></section>');

                }

            });
        };
    };

    var dataTableUrl = '',
        dataTablePref = '',
        dataFixtureUrl = '';

    function showTableData() {


        if (document.cookie && document.cookie.indexOf('load-table-' + dataTablePref + '=1') != -1) {
            loadLegueTable = false;
        } else {
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

    $('body').on('click touch', '.select-league a, .table-list a', function () {
        dataTableUrl = $(this).data('table-url');
        dataTablePref = $(this).data('table-pref');
        $('.league-select-popup').hide();
        showTableData();
    });

    $('body').on('click touch', '.fixture-list a', function () {
        
        dataFixtureUrl = $(this).data('fixture-url');
        dataTablePref = $(this).data('table-pref');
        $('.league-select-popup').hide();
        showFixtures();
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

        if ($('body').hasClass('offline-page')) {
            e.stopPropagation();
            document.location.href = "/";
            return '';
        };

        $('body').removeClass().addClass('league-table');
        
        $('.league-list').addClass('table-list').removeClass('fixture-list');

        tableScreen();

        showHideMenu();
        $('.update-table').css('display', 'none');


    });

    $('.home-button').on('click touch', function (e) {
        e.preventDefault();
        showHideMenu();

        $('.update-table').css('display', 'none');

        if ($('body').hasClass('offline-page')) {
            e.stopPropagation();
            document.location.href = "/";
            return '';
        };

        $('body').removeClass().addClass('home');

        $appBox.html('<section class="league-screen"><div class="select-league"><a href="#" data-table-url="http://api.football-data.org/v1/competitions/426/leagueTable" data-table-pref="PL" class="epl-home"><span></span></a><a href="#" data-table-url="http://api.football-data.org/v1/competitions/436/leagueTable" data-table-pref="PD" class="laliga-home"><span></span></a></div></section>');



        $('.league-name').html('');

    });

    $('.fixtures-button').on('click touch', function (e) {
        e.preventDefault();
        $('.update-table').hide();
        $('.league-name').html('Select league');
       
        $('.league-list').removeClass('table-list').addClass('fixture-list');

        if ($('body').hasClass('offline-page')) {
            e.stopPropagation();
            document.location.href = "/";
            return '';
        };

        showHideMenu();
        $('body').removeClass().addClass('fixtures');
        $appBox.html($fixtures);

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

    $('body').on('click touch', '.day li', function () {
        var matchDayIndex = $(this).data('matchday');
        $('.day li').removeClass('selected');
        $(this).addClass('selected');

        $('.matchday-box').hide();
        $('.matchday-' + matchDayIndex).show();
    });

    function showFixtures() {
        $.ajax({
            headers: {
                'X-Auth-Token': 'ad36d94a3eaf4dcf802b05c867b5e9e6'
            },
            url: dataFixtureUrl,
            dataType: 'json',
            type: 'GET',
            success: function (fixtureData) {

                $('.day ul').html('');
                $('.day-playes').html('');

                // insert into text and leagues list
                /* $appBox.html($introScreen + $leagueScreen);*/

                // save response to localstorage
                /*var fixtureData = JSON.stringify(response);
                localStorage.setItem('F', fixtureData);
                var fixtureData = JSON.parse(localStorage.getItem('Leagues'));*/

                console.log('use ajax - table screen');

                var last = fixtureData.fixtures.slice(-1)[0];
                var matchDayLast = last.matchday;
                var i = 0;

                for (i = 1; i <= matchDayLast; i++) {

                    var matchDayGames = fixtureData.fixtures.filter(function (obj) {
                        return obj.matchday == i;
                    });

                    $('.day ul').append('<li data-matchday="' + i + '">Day ' + i + '</li>')

                    $('.day-playes').append('<div class="matchday-box matchday-' + i + '"></div>')

                    $.each(matchDayGames, function (index) {

                        var homeTeam = matchDayGames[index].homeTeamName;
                        var awayTeam = matchDayGames[index].awayTeamName;
                        var resultsHome = matchDayGames[index].result.goalsHomeTeam;
                        var resultsAway = matchDayGames[index].result.goalsAwayTeam;

                        $('.matchday-' + i).append('<div><div>' + homeTeam + '</div><div>' + resultsHome + ' - ' + resultsAway + '</div><div>' + awayTeam + '</div></div>');

                    });


                };


            },
            beforeSend: function () {

                $('.app-box').addClass('overlay');
                $('.app-box').append('<div class="overlay-box"><div class="loader"><svg viewBox="0 0 32 32" width="32" height="32"><circle id="spinner" cx="16" cy="16" r="14" fill="none"></circle></svg></div></div>')

            },
            complete: function () {
                $('.app-box').removeClass('overlay');
                $('.overlay-box').remove();
                $('.day li').first().addClass('selected');
                $('.matchday-box').first().show();

            },
            error: function () {

            }

        });
    };

    $('.update-table').on('click touch', function (e) {
        e.preventDefault();
        runAjaxCall();
    });

    $('.league-name').on('click touch', function (e) {
        e.preventDefault();
        $('.league-select-popup').toggle();
    });


    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('service-worker.js')
            .then(function () {
                console.log('Service Worker Registered');
            });
    };
});

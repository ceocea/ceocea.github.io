$(document).ready(function() {
    initAjaxToken(); 
 
    $('.historys .short .top ul li a').each(function() {
        $(this).text($(this).text());
    });

    $('.leftbar .main-game .short .top ul li a').each(function() {
        $(this).text($(this).text());
    });

    $('.leftbar .end-game .bottom-game .us-win span').each(function() {
        $(this).text($(this).text());
    });

    $('.table .list .tb3 a').each(function() {
        $(this).text($(this).text());
    });
	
    $('#give_friend').click(function(event) {
        var modal = $('#popup_name-sf');
        modal.arcticmodal();

    });
    $('#sell_items').click(function(event) {
        var modal = $('#popup_name-sell');
        modal.arcticmodal();

    });

    $('#promocode').click(function(event) {
        var modal = $('#popup_name-promocode');
        modal.arcticmodal();
    });
 
	$('#open_settings').click(function(event) {
        var modal = $('#popup_name-settings');
        modal.arcticmodal();

    });
	
    CSGOGOLD.init();
    $('[data-modal]').click(function() {
        $($(this).data('modal')).arcticmodal();
        return false;
    });

    $('.no-link').click(function() {
        $('.linkMsg').removeClass('msgs-not-visible');
        return false;
    });

    $('.offer-link input, .offer-link-inMsg input')
        .keypress(function(e) {
            if (e.which == 13) $(this).next().click()
        })
        .on('paste', function() {
            var that = $(this);
            setTimeout(function() {
                that.next().click();
            }, 0);
        });

    $('.save-link, .save-link2').click(function() {
        var that = $(this).prev();
        $.ajax({
            url: '/settings/save',
            type: 'POST',
            dataType: 'json',
            data: {
                trade_link: $(this).prev().val()
            },
            success: function(data) {
                if (data.status == 'success') {
                    that.notify(data.msg, {
                        position: 'left middle',
                        className: "success"
                    });
                    $('.linkMsg').addClass('msgs-not-visible');
                } else {
                   error_sound();
                    if (data.msg) that.notify(data.msg, {
                        position: 'left middle',
                        className: "error"
                    });
                }
            },
            error: function() {
                error_sound();
                that.notify("Произошла ошибка. Попробуйте еще раз", {
                    position: 'left middle',
                    className: "error"
                });
            }
        });
        return false;
    });



});

function getRarity(rarity) {
    var rarity = '';
    var arr = rarity.split(',');
    if (arr.length == 2) rarity = arr[1].trim();
    if (arr.length == 3) rarity = arr[2].trim();
    if (arr.length && arr[0] == 'Нож') rarity = '★';
    switch (rarity) {
        case 'Армейское качество':
            rarity = 'milspec';
            break;
        case 'Запрещенное':
            rarity = 'restricted';
            break;
        case 'Засекреченное':
            rarity = 'classified';
            break;
        case 'Тайное':
            rarity = 'covert';
            break;
        case 'Ширпотреб':
            rarity = 'common';
            break;
        case 'Промышленное качество':
            rarity = 'common';
            break;
        case '★':
            rarity = 'rare';
            break;
        case 'card':
            rarity = 'card';
            break;
    }
    return rarity;
}

function n2w(n, w) {
    n %= 100;
    if (n > 19) n %= 10;

    switch (n) {
        case 1:
            return w[0];
        case 2:
        case 3:
        case 4:
            return w[1];
        default:
            return w[2];
    }
}

function lpad(str, length) {
    while (str.toString().length < length)
        str = '0' + str;
    return str;
}

 


var CSGOGOLD = function() {

    'use strict';

    var initAjaxToken = function() {
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            statusCode: {
                500: function() {
                    return;
                }
            }
        });
    };

    var initTooltips = function() {
        $(function() {
            $('[data-toggle="tooltip"]').tooltip();
        })
    };

    return {
        init: function() {
            initAjaxToken();
            CSGOGOLD.initTheme();
        },
        initTheme: function() {
            initTooltips();
        },
        alert: function(response) {
            return noty({
                text: response.text,
                type: response.type,
                theme: 'relax',
                layout: 'topRight',
                timeout: 5000,
                animation: {
                    open: 'animated bounceInRight',
                    close: 'animated bounceOutUp'
                }
            });
        }
    }
}();


if (START) {

    var socket = io.connect('tcp.csgogold.ru:8085', {
        secure: true
    });
    socket

    .on('newGame_coin', function(data){
 
            data = JSON.parse(data);
            $('#game-list').html(data.html);
			if ($("table #game-list").length <= 1 ) {
					$('.deposit-txt-info').addClass('hidden');
			}
				if ($("table #game-list").length >= 1 ) {
					$('.deposit-txt-info').removeClass('hidden');
				}
            var bh = $("body").height();
            $('.left-block').css('height', bh + 'px');
        })

        .on('message_trades', function(data) {
            if (data.uid == uid) {
                countselect_site = 0;
                sumselect_site = 0;
                $('#total_site_items').html(0);
                $('#count_site_items').html(0);
                if (data.status == 'success') {
                    if (data.msg == 'trade_accept') {
                        $.notify('Вы приняли обмен. Добавляем вещи в инвентарь!', {
                            className: "success"
                        });
                    }
					complete_sound();
                    var modal = $('#popup_name-deposit');
                    modal.arcticmodal('close');
                } else {

                    if (data.msg == 'trade_contr') {
                        $.notify('Вы сделали контрпредложение!', {
                            className: "error"
                        });
                    }
                    if (data.msg == 'trade_decline') {
                        $.notify('Обмен отклонён!', {
                            className: "error"
                        });
                    }
                    if (data.msg == 'trade_no_accept') {
                        $.notify('Вы не успели принять обмен, попробуйте еще раз!', {
                            className: "error"
                        });
						
                    }
                    var modal = $('#popup_name-deposit');
                    modal.arcticmodal('close');
                    error_sound();
                }
            }
        })
        .on('add_inventory', function(data) {
            if (data.uid == uid) {
                LoadSaitInventory();
            }
        })
        .on('message_trades_w', function(data) {
            if (data.uid == uid) {
                countselect_site = 0;
                sumselect_site = 0;
                $('#total_site_items').html(0);
                $('#count_site_items').html(0);
                LoadSaitInventory();
                if (data.status == 'success') {
                    if (data.msg == 'trade_accept') {
                        $.notify('Вещи успешно выведены!', {
                            className: "success"
                        });
                        var modal = $('#popup_name-withrdaw');
                        modal.arcticmodal('close');
					complete_sound();
                    }
                } else {
                    if (data.msg == 'trade_contr') {
                        $.notify('Обмен отклонён. Вы сделали контр-предложение!', {
                            className: "error"
                        });
                    }
                    if (data.msg == 'trade_endtime') {
                        $.notify('Закончилось время обмена!', {
                            className: "error"
                        });
                    }
                    if (data.msg == 'trade_decline') {
                        $.notify('Обмен отклонён!', {
                            className: "error"
                        });
                    }
                    if (data.msg == 'trade_noitems') {
                        $.notify('Вещи больше недоступны для обмена!', {
                            className: "error"
                        });
                    }
                    if (data.msg == 'trade_error') {
                        $.notify('Ошибка!', {
                            className: "error"
                        });
                    }
                    if (data.msg == 'trade_endtimes') {
                        $.notify('Бот отклонил ваш обмен!', {
                            className: "error"
                        });
                    }
                    error_sound();

                    var modal = $('#popup_name-withrdaw');
                    modal.arcticmodal('close');
                }
            }
        })
        .on('trades', function(data) {
            if (data.uid == uid) {
                if (data.error == true) {
                    $.notify(data.msg, {
                        className: "error"
                    });
                    error_sound();
                } else {
                    complete_sound();
                    $('#trade_link_offer').attr('href', 'https://steamcommunity.com/tradeoffer/' + data.tid);
                    $('#trade_id_offer').text(data.tid);
                    $('#trade_code_offer').text(data.code);
                    var modal = $('#popup_name-deposit');
                    modal.arcticmodal();
                }
            }
        })
        .on('trades_withdraw', function(data) {
            if (data.uid == uid) {
                if (data.error == true) {
                    $.notify(data.msg, {
                        className: "error"
                    });
                    error_sound();
                } else {
                    complete_sound();
                    $('#trade_id_offer').text(data.tid);
                    $('#trade_code_offer').text(data.code);
                    var modal = $('#popup_name-withrdaw');
                    modal.arcticmodal();
                }
            }
        })

        .on('online', function(data) {
            $('.online').text(Math.abs(data));
        })
        .on('newGiveaway', function(data) {
            if (data.msg == 'empty') {
                $('.giveaway').hide();
                $('.giveaway-te').hide();
            } else {
                $('#img_item').html('<img alt="" src="https://steamcommunity-a.akamaihd.net/economy/image/class/730/'+data.img_item+'/55fx55f">')
                $('#name_item').text(data.name_item);
                $('#count_user').text(0);
                $('#count_user_all').text(data.count_user_all);
                $('.giveaway').show();
                $('.giveaway-te').show();
            }
        })
        .on('acceptGiveaway', function(data) {
            $('#count_user').text(data);
        })
                .on('newDeposit', function(data) {

            data = JSON.parse(data);

            if (data) {
                function addbet() {
                    $('#bets').prepend(data.html);
                    $('#bet_' + data.betId).hide().slideDown("slow");
					$('[data-toggle="tooltip"]').tooltip();
                } 
                setTimeout(addbet, 50) 
            } 

			
			if (checkUrl_deposit_game()) {
                newbet_sound();
            }


            var username = $('#bet_' + data.id + ' .short .user .username').text();
            $('#bet_' + data.id + ' .short .user .username').text(username);
            $("#roundBank").countTo(Math.round(data.gamePrice));
            $('.radial-progress').attr('data-progress', Math.round(data.itemsCount * 1.25));
            $('#col_items').html(data.itemsCount + ' / 80');


            html_chances = '';
            data.chances = sortByChance(data.chances);
            data.chances.forEach(function(info) {
                if (uid == info.uid) {
                    $('#myItems').text(info.items + n2w(info.items, [' предмет', ' предмета', ' предметов']));
                    $('#myChance').text(info.chance);
                }
                html_chances +=
                    '<div class="players-percent-block">' +
                    '<img alt="" src="' + info.avatar + '">' +
                    '<div class="players-percent-text">' + info.chance + '%</div>' +
                    '</div>';
            });

            $('#players-list').removeClass('hidden');
            $('#players-list').html(html_chances);

            if (data.chances.length == 2) {
                $('.main_banner').addClass('hidden');
            };

            $('.leftbar .main-game .short .top ul li a').each(function() {
                $(this).text($(this).text());
            });




            function getRandomArbitary(min, max) {
                return Math.random() * (max - min) + min;
            }

            CSGOGOLD.initTheme();
        })

    .on('forceClose', function() {
            $('.forceClose').removeClass('msgs-not-visible');
        })
        .on('timer', function(time) {
            if (timerStatus) {
                timerStatus = false;
                $('.gameEndTimer').empty().removeClass('not-active').countdown({
                    seconds: time
                });
            }
        })
        .on('slider', function(data) {
            if (ngtimerStatus) {
                ngtimerStatus = false;
				 $('.gameEndTimer').empty().removeClass('not-active').countdown({
                    seconds: 0
                });
                $('.forceClose').addClass('msgs-not-visible');
                var users = data.users; 
                users[105] = data.winner;
                html = '';
                users.forEach(function(as, i) {
                    if (as.avatar == undefined) {} else {
                        html += '<li><img alt="" src="' + as.avatar + '"></li>';
                    }
                });  
                $('.ngtimer').empty().countdown({
                    seconds: data.time
                });
				
                $('.current-round .game-progress').addClass('hidden');
                $('#gameCarousel').removeClass('hidden');
                $('.roulette1').html(html);
                $('.winner-cost-value').text(Math.round(data.gamePrice));
                $('.winner-name span').text('???');
                $('.winner-cost-ch').text('???');
                $('#winner-ticket').html('???');
                $('#winnernh').text('???');
                $('.roulette1').removeClass('active');
                if (data.showSlider) {
                    setTimeout(function() {
                        $('.roulette1').addClass('active');
						  if (checkUrl_deposit_game()) {
							   jackpot_sound();
							}  
                    }, 500);
                }
                var timeout = data.showSlider ? 5 : 0;
                setTimeout(function() {
                    $('.gameEnd.current-round').removeClass('msgs-not-visible');
                    $('.winner-cost-ch').text(data.chance + '%');
                    $('.winner-name span').text(data.winner.username);
                    $('#winner-ticket').text('#' + data.ticket);
                    $('#winnernh').text(data.round_number);
                    $.post('/getBalance', function(data) {
                        $('.update_balance').text(Math.round(data));

                    });

                }, 1000 * timeout);
            }
        })

			.on('lastwinner', function(data) {
            $('#winidrest').text(data.username);
            $('#winmoner').html(data.price + ' <i style="font-size: 10px;" class="profile fa fa-diamond" aria-hidden="true"></i>');
            $('#winchancet').html(data.percent + '%');
            $('#winavatar').html('<img src="' + data.avatar + '" alt="" title="" />');
            if (data.uid == uid) {
                LoadSaitInventory(); 
                countselect_site = 0;
                sumselect_site = 0;
				$('#count_site_items').html(0);
				$('#totalcount_site_items').html(0);
				$('#total_site_items').html(0);
            }

        })
        .on('info1', function(data) {
            $('#stater_1').html(data); 
        })
        .on('info2', function(data) {
            $('#stater_2').html(data);
        })
        .on('info3', function(data) {
            $('#stater_3').html(data);
        })
        .on('info4', function(data) {
            $('#stater_4').html(data);
        })

    .on('newGame', function(data) {
			
			if (checkUrl_deposit_game()) { 
              jackpot_ng_sound();
				}
           
			$('.main_banner').removeClass('hidden');
            $('#players-list').addClass('hidden'); 
            $('.gameEnd.current-round').addClass('msgs-not-visible');
            $('.current-round .game-progress').removeClass('hidden');
            $('.current-round .details-wrap').removeClass('hidden');
            $('#gameCarousel').addClass('hidden');
            $('.roulette1').removeClass('active');
            $('#bets').html('');
            $('#animate_items_container').css('transition', '0s');
            $('#animate_items_container').css('transform', 'translateY(0px)');
            $('#myItems').text('0 предметов');
            $('#myChance').text(0);
            $('#roundId').text(data.id);
            $('#roundBank').text(0);
            $('#winnernh').text('???');
            $('#col_items').html('0 / 80');
            $('.radial-progress').attr('data-progress', 0);
            $('.gameEndTimer').addClass('not-active');
            timerStatus = true;
            ngtimerStatus = true;

        })
 

        if (checkUrl_game()) {
        socket.on('joinGame', function(data){
            data = JSON.parse(data);
            gameNumber = data.game.id;
            if (checkUrl_gameNumber(gameNumber)) { 
				$('#avatar').attr('src',data.game.avatar_2);
				$('#username').text(data.game.username_2);
                $('#stavka').text(data.game.price_2);
                chance = (data.game.price_2 / (data.game.price_1 + data.game.price_2)) * 100;
                $('#chance_2').text(data.game.chance_2+'%');
                $('#items').html(data.items);
                var i = 5;
                var timerId = setInterval(function() {
                    i--;
                    if (i > 0) {
                        $('.time').text('00:0'+i);
                    } else {
                        $('.time').text('00:00');
                        clearInterval(timerId);
                    }
                }, 1000);
                setTimeout(function() {
                    if (data.game.win_team == 1) {
                        $('.rotate').attr('style','-webkit-transform: rotate(1170deg);');
                        setTimeout(function() {
                            $('#counter-teror').addClass('bord');
                        },3000);
                    }
                    if (data.game.win_team == 2) {
                        $('.rotate').attr('style','-webkit-transform: rotate(990deg);');
                        setTimeout(function() {
                            $('#teror').addClass('bord');
                        },3000);
                    }
                    $.ajax({
                            url: '/coinflip/end/game', 
                            type: 'POST', 
                            dataType: 'json', 
                            data: { id: data.game.id
                        }
                    });
                }, 5000);
            }   
        })
    }


    var declineTimeout,
        timerStatus = true,
        ngtimerStatus = true;
}

function showPending_withdraw(data) {
    var content = '<br><strong>Вам отправлен обмен.</strong>';
    content +=    '<br> Вы можете подтвердить его <a target="_blank" href="https://steamcommunity.com/tradeoffer/' + data.tid +'">здесь</a><br>';
    content +=    'У вас есть 3 минуты для потверждения обмена, <br>иначе он будет <font color="#d84949">отменен</font><br><br>';
    content +=    '<strong>Trade #<span>'+data.tid+'</span> | Code: <span>'+data.code+'</span></strong>';
    $("#withdraw").prepend(content);
}

function mergeWithDescriptions(items, descriptions) {
    return Object.keys(items).map(function(id) {
        var item = items[id];
        var description = descriptions[item.classid + '_' + (item.instanceid || '0')];
        for (var key in description) {
            item[key] = description[key];

            delete item['icon_url'];
            delete item['icon_drag_url'];
            delete item['icon_url_large'];
        }
        return item;
    })
}

function flipCoin(t) { 
	letsgo_sound(); 
    if (t == 1) $('#coin').addClass('animation900');
    if (t == 2) $('#coin').addClass('animation1260');
    if (t == 3) $('#coin').addClass('animation1620');
    if (t == 4) $('#coin').addClass('animation1980');
    if (t == 5) $('#coin').addClass('animation1080');
    if (t == 6) $('#coin').addClass('animation1440');
    if (t == 7) $('#coin').addClass('animation1800');
    if (t == 8) $('#coin').addClass('animation2160');
}

function join_game(id) {
    var csv = "";
    $(".inv-stuff .used").each(function(i, e) {
        csv += $(this).data("id") + ",";
    });
    $.ajax({
        url: "/coinflip/join/game",
        type: "POST",
        data: {
            "id": id,
            "items": csv
        },
        success: function (data) {
            if (data.status == 'success') {
                window.location.href = ('/coinflip/game/'+id);
            } else {
              	$.notify(data.msg, {
				className:   data.type
				});	 
			 error_sound();
            }
        },
        error: function () {
         $.notify(data.msg, {
				className:   data.type
				});	 
			 error_sound();
        }
    });
}
function checkUrl_deposit_game() {
    var pathname = window.location.pathname;
    if (pathname == '/') {
        return true;
    } else {
        return false;
    }

}
function checkUrl_game() {
    var pathname = window.location.pathname;
    if (pathname.indexOf('coinflip/game') + 1) {
        return true;
    } else {
        return false;
    }

}
function checkUrl_gameNumber(gameNumber) {
    var pathname = window.location.pathname;
    if (pathname.indexOf('coinflip/game/' +gameNumber) + 1) {
        return true;
    } else {
        return false;
    }

}


var chats = $.cookie('chats');
if (chats == 'on') {
    $('.chat-messages').removeClass('hidden');
    $('#open_ch').addClass('hidden');
    $('#close_ch').removeClass('hidden');
    $('.rightbar1 .cha .form').removeClass('hidden');
} else {

    $('.chat-messages').addClass('hidden');
    $('#open_ch').removeClass('hidden');
    $('#close_ch').addClass('hidden');
    $('.rightbar1 .cha .form').addClass('hidden');
}


$(document).on('click', '#open_ch', function(e) {
    e.preventDefault();

    $('.chat-messages').removeClass('hidden');
    $('#open_ch').addClass('hidden');
    $('#close_ch').removeClass('hidden');
    $('.rightbar1 .cha .form').removeClass('hidden');

    chats = 'on';
    $.cookie('chats', 'on', {
        expires: 365
    });
});

$(document).on('click', '#close_ch', function(e) {
    e.preventDefault();
    $('.chat-messages').addClass('hidden');
    $('#open_ch').removeClass('hidden');
    $('#close_ch').addClass('hidden');
    $('.rightbar1 .cha .form').addClass('hidden');
    chats = 'off';
    $.cookie('chats', 'off', {
        expires: 365
    });
});


$(".toggle-btn").click(function(e) {
    e.preventDefault();
    $(this).prev().toggleClass("bottomtxt-open")
});

function sortByChance(arrayPtr) {


    var temp = [],
        item = 0;



    for (
        var counter = 0; counter < arrayPtr.length; counter++) {
        temp = arrayPtr[counter];
        item = counter - 1;
        while (item >= 0 && arrayPtr[item].chance < temp.chance) {
            arrayPtr[item + 1] = arrayPtr[item];
            arrayPtr[item] = temp;
            item--;
        }
    }
    return arrayPtr;

}

var sumselect_steam = 0;
var countselect_steam = 0;
var sumselect_site = 0;
var countselect_site = 0;

function loadMyInventorySteam() {
    $('[data-toggle="tooltip"]').tooltip();
    sumselect_steam = 0;
    countselect_steam = 0;
    $('#total_price').html(0);
    $('#total_count').html(0);
    $('[data-toggle="tooltip"]').tooltip();
    $.ajax({
        url: '/user/me/inventory',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            items = '';
            steam = 'steam';
            data['itemTemplate'].forEach(function(i) {
                items += '<div class="items-block-item ' + i.rarity + '" data-price="' + i.price + '" data-inventoryid="' + i.id + '" id="' + i.id + '-f" onclick="selectItem(' + i.id + ',' + steam + ');">\
    <div data-toggle="tooltip" class="item-cont" data-original-title="' + i.name + '">\
        <div class="price_item">\
            <span class="price">' + Math.round(i.price) + '</span>\
            <span class="price_"><i class="fa fa-diamond" aria-hidden="true"></i></span>\
        </div>\
        <div class="item-wrap-img"><img alt="" src="//steamcommunity-a.akamaihd.net/economy/image/class/730/' + i.classId + '/68fx68f">\
                        </div>\
                    </div>\
                </div>';
            });
            $('#loadinventorysteam').html(items);
            $('[data-toggle="tooltip"]').tooltip();
        },
        error: function() {
            $('#loadinventorysteam').html(
                '<div class="error">\
                    <strong class="error-message ng-binding">Не удалось получить содержимое инвентаря. Возможео проблемы со Steam, или убедитесь что ваш инвентарь открыт и в нем есть предметы, для которых разрешен обмен.</strong>\
                    <div>\
                        <div>\
                            <ol>\
                                <li><p>Откройте Steam, нажмите по своему логину и перейдите во вкладку <b>"Инвентарь"</b></p>\
                                <img src="/assets/images/inventory.png">\
                                </li>\
                                <li><p>Нажмите кнопку <b>"Еще..."</b> и кликните по <b>"Настройки приватности инвентаря"</b></p>\
                                <img src="/assets/images/more.png">\
                                </li>\
                                <li><p>Отметьте кружок <b>"Открытый во"</b>" вкладке <b>"Инвентарь"</b> и нажмите <b>"Сохранить изменения"</b></p>\
                                <img src="/assets/images/save.png">\
                                </li>\
                            </ol>\
                        </div>\
                    </div>\
                </div>'
            );
            error_sound();
            $('[data-toggle="tooltip"]').tooltip();
        }
    });
    $('[data-toggle="tooltip"]').tooltip();
}

function selectItem(assetid, tag) {

    if (tag == 'steam') {
        if (countselect_steam >= 32) {
            error_sound();
            $.notify('Максимум 32 предмета за 1 обмен!', {
                position: 'top right',
                className: "error"
            });
            return;
        }
        $('#' + assetid + '-f').attr('onclick', 'unselectItem(' + assetid + ', \'' + tag + '\');');
        sumselect_steam = sumselect_steam + Number($('#' + assetid + '-f').attr('data-price'));
        countselect_steam = countselect_steam + 1;
        var ret = Math.round(sumselect_steam);
        var pet = countselect_steam;
        $('#total_price').html(ret);
        $('#total_count').html(pet);
    }
    if (tag == 'site') {
        $('#' + assetid + '-f').attr('onclick', 'unselectItem(' + assetid + ', \'' + tag + '\');');
        countselect_site = countselect_site + 1;
        sumselect_site = sumselect_site + Number($('#' + assetid + '-f').attr('data-price'));
        var ret = Math.round(sumselect_site);
        var pet = countselect_site;
        var sell = Math.round(ret * 90 / 100);
        $('#total_site_items').html(ret);
        $('#total_site_items_1').html(ret);
        $('#total_site_items_2').html(sell);
        $('#count_site_items').html(pet);
    }
    click_sound();
    $('#' + assetid + '-f').addClass('used');
}

function unselectItem(assetid, tag) {
   click_sound();
    $('#' + assetid + '-f').attr('onclick', 'selectItem(' + assetid + ', \'' + tag + '\');');
    if (tag == 'steam') {
        sumselect_steam = sumselect_steam - Number($('#' + assetid + '-f').attr('data-price'));
        countselect_steam = countselect_steam - 1;
        var ret = Math.round(sumselect_steam);
        var pet = countselect_steam;
        $('#total_price').html(ret);
        $('#total_count').html(pet);
    }
    if (tag == 'site') {
        countselect_site = countselect_site - 1;
        sumselect_site = sumselect_site - Number($('#' + assetid + '-f').attr('data-price'));
        var ret = Math.round(sumselect_site);
        var pet = countselect_site;
        var sell = Math.round(ret * 90 / 100);
        $('#total_site_items').html(ret);
        $('#total_site_items_1').html(ret);
        $('#total_site_items_2').html(sell);
        $('#count_site_items').html(pet);
    }
    $('#' + assetid + '-f').removeClass('used');
}

function offer() {
    var csv = "";
    $(".items-block-item.used").each(function(i, e) {
        csv += $(this).data("inventoryid") + ",";
    });
    $.ajax({
        url: "/deposit_items",
        type: "GET",
        data: {
            "items": csv
        },
        success: function(data) {
            if (data.status == 'success') {
                $.notify(data.msg, {
                    className: "success"
                });
                var modal = $('#popup_name-777');
                modal.arcticmodal('close');
            } else {
                $.notify(data.msg, {
                    className: "error"
                });
                 error_sound();
            }
        },
        error: function() {
            $.notify("Произошла ошибка", {
                className: "error"
            });
             error_sound();
        }
    });
}

function get_offer() {
    var csv = "";
    $(".inv-stuff .used").each(function(i, e) {
        csv += $(this).data("id") + ",";
    });
    $.ajax({
        url: "/get_offer",
        type: "GET",
        data: {
            "items": csv
        },
        success: function(data) {
            if (data.status == 'success') {
                $.notify(data.msg, {
                    className: "success"
                });
            } else {
                $.notify(data.msg, {
                    className: "error"
                });
                 error_sound();
            }
        },
        error: function() {
            $.notify("Произошла ошибка", {
                className: "error"
            });
            error_sound();
        }
    });
}

 
    var side_selected = 0;

    $('#duel-select-side-ct').click(function() {
        side_selected = 1;
        $('#duel-select-side-t').removeClass('active');
        $(this).addClass('active');
    });

    $('#duel-select-side-t').click(function() {
        side_selected = 2;
        $('#duel-select-side-ct').removeClass('active');
        $(this).addClass('active');
    });

	
function newcoin() {
        var csv = "";
        $(".inv-stuff .used").each(function(i, e) {
            csv += $(this).data("id") + ",";
        });
        $.ajax({
            url: 'coinflip/create/game',
            type: 'POST',
            dataType: 'json',
            data: {
                team: side_selected,
                items: csv
            },
            success: function (data) {
                if (data.status == 'success') {
                    window.location.href = 'coinflip/game/'+data.gameid; 
                } else {
                    $.notify(data.msg, {
                   className:   data.type
                });
				 error_sound();
                }
            },
            error: function () {
                       $.notify(data.msg, {
                   className:   data.type
                });
				 error_sound();
            }
        }); 
    };
	
function newbet() {
    var csv = "";
    $(".inv-stuff .used").each(function(i, e) {
        csv += $(this).data("id") + ",";
    });
    $.ajax({
        url: "/newbet",
        type: "POST",
        data: {
            "items": csv
        },
        success: function(data) {
            if (data.status == 'success') {
                $.notify(data.msg, {
                    className: "success"
                });
                countselect_site = 0;
                sumselect_site = 0;
                $('#total_site_items').html(0);
                $('#count_site_items').html(0);
                LoadSaitInventory(); 
            } else {
                $.notify(data.msg, {
                    className: "error"
                });
                error_sound();
                countselect_site = 0;
                sumselect_site = 0;
                $('#total_site_items').html(0);
                $('#count_site_items').html(0);
                $(".items-bblock-item.used").each(function (i, e) {
                    $(this).removeClass('used');
                    assetid = $(this).data("id");
                    $('#' + assetid + '-f').attr('onclick', 'selectItem(' + assetid + ', \'site\');');
                });
            }
        },
        error: function() {
            $.notify("Произошла ошибка", {
                className: "error"
            });
             error_sound();
        }
    });
}

function sales_items() {
    var csv = "";
    $(".inv-stuff .used").each(function(i, e) {
        csv += $(this).data("id") + ",";
    });
    $.ajax({
        url: "/sales_items",
        type: "POST",
        data: {
            "items": csv
        },
        success: function(data) {
            if (data.status == 'success') {

                $.notify(data.msg, {
                    className: "success"
                });
                countselect_site = 0;
                sumselect_site = 0;
                $('#total_site_items').html(0);
                $('#count_site_items').html(0); 
                LoadSaitInventory();
                $.post('/getBalance', function(data) {
                    $('.update_balance').text(Math.round(data));

                });
                var modal = $('#popup_name-sell');
                modal.arcticmodal('close');
            } else {
                $.notify(data.msg, {
                    className: "error"
                });
              error_sound();
				var modal = $('#popup_name-sell');
                modal.arcticmodal('close');
                countselect_site = 0;
                sumselect_site = 0;
                $('#total_site_items').html(0);
                $('#count_site_items').html(0);
                $(".items-bblock-item.used").each(function (i, e) {
                    $(this).removeClass('used');
                    assetid = $(this).data("id");
                    $('#' + assetid + '-f').attr('onclick', 'selectItem(' + assetid + ', \'site\');');
                });
            }
        },
        error: function() {
            $.notify("Произошла ошибка", {
                className: "error"
            });
          error_sound();
        }
    });
}
function active_promocode() {
    var promocode = $('#promocode_id').val();
    $.ajax({
        url: "/active_promocode",
        type: "POST",
        data: {
            "promocode": promocode
        },
        success: function(data) {
            if (data.status == 'success') {
                $.notify(data.msg, {
                    className: "success"
                });
                var modal = $('#popup_name-promocode');
                modal.arcticmodal('close');
            } else {
                $.notify(data.msg, {
                    className: "error"
                });
                error_sound();
            }
        },
        error: function() {
            $.notify("Произошла ошибка", {
                className: "error"
            });
            error_sound();
        }
    });
}
function send_friend() {
    var csv = "";
    var friend = $('#friend_id').val();
    $(".inv-stuff .used").each(function(i, e) {
        csv += $(this).data("id") + ",";
    });
    $.ajax({
        url: "/send_friend",
        type: "POST",
        data: {
            "items": csv,
            "friend": friend
        },
        success: function(data) {
            if (data.status == 'success') {
                $.notify(data.msg, {
                    className: "success"
                });
                countselect_site = 0;
                sumselect_site = 0;
                $('#total_site_items').html(0);
                $('#count_site_items').html(0); 
                LoadSaitInventory();
                var modal = $('#popup_name-sf');
                modal.arcticmodal('close');
            } else {
                $.notify(data.msg, {
                    className: "error"
                });
                error_sound();
                countselect_site = 0;
                sumselect_site = 0;
                $('#total_site_items').html(0);
                $('#count_site_items').html(0);
                $(".items-bblock-item.used").each(function (i, e) {
                    $(this).removeClass('used');
                    assetid = $(this).data("id");
                    $('#' + assetid + '-f').attr('onclick', 'selectItem(' + assetid + ', \'site\');');
                });
            }
        },
        error: function() {
            $.notify("Произошла ошибка", {
                className: "error"
            });
            error_sound();
        }
    });
}

function addInventory() {
    CSGOGOLD.initTheme();
    $('#popup_name-2').attr('style', 'display: none;');
    $('#popup_name-balance').attr('style', 'display: none;');
    $('#fade').hide();
    var modal = $('#popup_name-777');
    modal.arcticmodal();
    loadMyInventorySteam();
}


jQuery.fn.extend({
	countTo: function(x, opts) {
		opts = opts || {};
		var dpf = "";
		var dolls = $("#settings_dongers").is(":checked");
		if (dolls) {
			dpf = "$";
			x = x / 1000;
		}
		var $this = $(this);
		var start = parseFloat($this.html());
		var delta = x - start;
		if (opts.color) {
			if (delta > 0) {
				$this.addClass("text-success");
			} else if (delta < 0) {
				$this.addClass("text-danger");
			}
		}
		var prefix = "";
		if (opts.keep && delta > 0) {
			prefix = "+";
		}
		var durd = delta;
		if (dolls) {
			durd *= 100;
		}
		var dur = Math.min(400, Math.round(Math.abs(durd) / 500 * 400));
		$({
			count: start
		}).animate({
			count: x
		}, {
			duration: dur,
			step: function(val) {
				var vts = 0;
				if (dolls) {
					vts = val.toFixed(3);
				} else {
					vts = Math.floor(val);
				}
				$this.html("" + prefix + (vts));
			},
			complete: function() {
				if (!opts.keep) {
					$this.removeClass("text-success text-danger");
				}
				if (opts.callback) {
					opts.callback();
				}
			}
		});
	}
});

function initAjaxToken() {
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
};
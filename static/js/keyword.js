$(function () {

    // 默认搜索引擎记录
    const searchTypeStore = {
        set: function (type) {
            localStorage.setItem('SearchType', type);
        },
        get: function () {
            return localStorage.getItem('SearchType') || 'bing';
        },
    };

    const $searchMethods = $('#search_methods');
    const $searchLogo = $('#search_logo');
    // 搜索引擎切换
    const $searchKeyword = $('#search_keyword');
    const $clearKeyword = $('#clear_keyword');
    const initSearchType = searchTypeStore.get();
    const $document = $(document);

    $searchLogo.addClass(initSearchType).data('type', initSearchType);

    const search_types = [
        {url: 'https://www.baidu.com/s?wd=', type: 'baidu'},
        {url: 'https://kaifa.baidu.com/searchPage?wd=', type: 'develop'},
        {url: 'https://www.sogou.com/web?query=', type: 'sogou'},
        {url: 'https://cn.bing.com/search?q=', type: 'bing'},
        {url: 'https://www.so.com/s?q=', type: 'so'},
        {url: 'https://www.google.com/search?q=', type: 'google'},
        {url: 'http://www.cilimao.cc/search?word=', type: 'cili'},
        {url: 'http://neets.cc/search?key=', type: 'yingyin'},
    ];
    $searchLogo.on('click', function () {
        $searchMethods.show();
    });

    $searchMethods.on('click', 'li', function () {
        let type = $(this).data('type');
        searchTypeStore.set(type);
        $searchLogo.removeClass()
            .data('type', type)
            .addClass(type + ' search-logo');
        $searchMethods.hide();
        $searchKeyword.focus();
    });
    $searchMethods.on('mouseleave', function () {
        $searchMethods.hide();
    });

    const EVENT_CLEAR_KEYWORD = 'clearKeyword';
    const EVENT_SEARCH = 'search';
    // 关键词搜索输入
    $searchKeyword.on('keyup', function (event) {
        let keyword = $(this).val();
        if (event.which === 13) {
            let $searchResult = $('#search_result .active');
            if ($searchResult.length > 0) {
                keyword = $searchResult.eq(0).text();
            }
            openSearch(keyword)
            return;
        }
        // TODO 上下键选择待选答案
        let bl = moveChange(event);
        if (bl) {
            keywordChange(keyword);
        }
    }).on('blur', function () {
        // 推荐结果跳转
        $('#search_result').on('click', 'li', function () {
            let word = $(this).text();
            $searchKeyword.val(word);
            openSearch(word);
            $('#search_result').hide();
        });
        // 解决失焦和点击事件冲突问题
        setTimeout(function () {
            $('#search_result').hide();
        }, 100)
    }).on('focus', function () {
        let keyword = $(this).val();
        keywordChange(keyword);
    });

    function moveChange(e) {
        let k = e.keyCode || e.which;
        let bl = true;
        switch (k) {
            case 38:
                rowMove('top');
                bl = false;
                break;
            case 40:
                rowMove('down');
                bl = false;
                break;
        }
        return bl;
    }

    function rowMove(move) {
        let search_result = $('#search_result');
        let hove_li = null;
        search_result.find('.result-item').each(function () {
            if ($(this).hasClass('active')) {
                hove_li = $(this).index();
            }
        });
        if (move === 'top') {
            if (hove_li == null) {
                hove_li = search_result.find('.result-item').length - 1;
            } else {
                hove_li--;
            }
        } else if (move === 'down') {
            if (hove_li == null) {
                hove_li = 0;
            } else {
                hove_li === search_result.find('.result-item').length - 1 ? (hove_li = 0) : (hove_li++);
            }
        }
        search_result.find('.active').removeClass('active');
        search_result.find('.result-item').eq(hove_li).addClass('active');
        $searchKeyword.val(search_result.find('.result-item').eq(hove_li).addClass('active').text());
    }


    function keywordChange(keyword) {
        if (keyword === '') {
            $document.trigger(EVENT_CLEAR_KEYWORD);
        } else {
            $document.trigger(EVENT_SEARCH, keyword);
            $clearKeyword.show();
        }
    }

    // 清空输入框
    $clearKeyword.on('click', function () {
        $searchKeyword.val('');
        $searchKeyword.focus();
        $document.trigger(EVENT_CLEAR_KEYWORD);
    });

    // 点击高亮显示
    $searchKeyword.on('focus', function () {
        $('.search-left').css(
            {
                "border-style": "solid",
                "border-color": "rgba(24, 144, 255, 1)",
                "box-shadow": "0px 0px 2px 1px rgba(145, 213, 255, 0.96)",
            }
        );
    }).on('blur', function () {
        $('.search-left').prop('style', '');
    });
    // 搜索
    $('#search_submit').on('click', function () {
        let keyword = $searchKeyword.val();
        let type = getSearchType();
        let baseUrl = search_types.find(function (item) {
            return item.type === type;
        });
        if (baseUrl && keyword) {
            window.open(baseUrl.url + keyword);
        }
    });

    $document.on(EVENT_CLEAR_KEYWORD, function () {
        $clearKeyword.hide();
        $('#search_result').hide();
    });
    $document.on(EVENT_SEARCH, function (e, keyword) {
        getSearchResult(keyword);
    });

    // 获取搜索引擎类型
    function getSearchType() {
        return $searchLogo.data('type');
    }

    // google 搜索结果
    function searchResultGoogle(data) {
        let result = data[1];
        result = result.map(function (item) {
            return item[0];
        });
        renderSearchResult(result);
    }

    // 百度 搜索结果
    function searchResultBaidu(data) {
        if (data === undefined) {
            return;
        }
        let result = data.s;
        renderSearchResult(result);
    }

    // 渲染搜索结果
    function renderSearchResult(array) {
        let $result = $('#search_result');
        $result.empty().hide();
        if (!array || array.length <= 0) {
            return;
        }
        for (let i = 0; i < array.length; i++) {
            let $li = $('<li class=\'result-item\'></li>');
            $li.text(array[i]);
            $result.append($li);
        }
        $result.show();
    }

    window.searchResultGoogle = searchResultGoogle;
    window.searchResultBaidu = searchResultBaidu;

    const search_suggest = {
        baidu: {
            url: 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su',
            data: function (keyword) {
                return {
                    wd: keyword,
                    cb: 'window.searchResultBaidu',
                };
            },
        },
        google: {
            url: 'http://suggestqueries.google.com/complete/search',
            data: function (keyword) {
                return {
                    q: keyword,
                    jsonp: 'window.searchResultGoogle',
                    client: 'youtube',
                };
            },
        }
    };

    /**
     * 从对应的网站获取搜索建议
     * @param keyword
     */
    function getSearchResult(keyword) {
        let searchType = getSearchType();
        let suggest = search_suggest[searchType];
        if (!suggest) {
            suggest = search_suggest.baidu;
        }
        $.ajax({
            url: suggest.url,
            dataType: 'jsonp',
            data: suggest.data(keyword),
        });
    }

    function openSearch(keyword) {
        let type = getSearchType();
        let baseUrl = search_types.find(function (item) {
            return item.type === type;
        });
        if (baseUrl && keyword) {
            window.open(baseUrl.url + keyword, keyword);
        }
    }
})
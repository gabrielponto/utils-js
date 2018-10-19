var Utils = {
    /**
     * Return if a parameter os a function is defined
     */
    isDefined: function(param) {
        return typeof(param) != 'undefined';
    }
};
/**
 * URL Module
 */
Utils.URL = {
    appendParams: function(url, paramsObject, appendIfNull, valueIfNull) {
        var paramsString = this.getParamsString(paramsObject, appendIfNull, valueIfNull);
        // Check if url contains a '?', If this is not the last char, we append the params with '&'
        var pointIndex = url.indexOf('?');
        var charSeparator = '?';
        if (pointIndex < 0) {
            // There's no '?' character on url string
            charSeparator = '?';
        } else {
            if (pointIndex == (url.length - 1)) {
                // In this case, '?' is the last digit, so we have to only append url.
                charSeparator = '';
            } else {
                charSeparator = '&';
            }
        }
        return url + charSeparator + paramsString;
    },
    getParamsString: function(paramsObject, appendIfNull, valueIfNull) {
        var urlParams = [];
        if (!Utils.isDefined(appendIfNull)) appendIfNull = true;
        if (!Utils.isDefined(valueIfNull)) valueIfNull = '';
        for (var key in paramsObject) {
            if (paramsObject.hasOwnProperty(key)) {
                var value = paramsObject[key];
                if (!Utils.isDefined(value) || value === null || value == undefined) {
                    if (appendIfNull) {
                        urlParams.push(key + '=' + valueIfNull);   
                    }
                } else {
                    urlParams.push(key + '=' + paramsObject[key]);
                }
            }
        }
        return urlParams.join('&');
    }
}
/**
 * Currency Module
 */
Utils.Currency = {
    _defaultCurrency: 'EUR',
    /**
     * Format a string or float number into a currency format
     * Based on https://stackoverflow.com/a/14428340/1848721
     * @param value string|float The value to be converted
     * @param currency(optional) string A 3 digits code of currency. Eg: EUR. The default is EUR
     * @param showSymbol(optional) boolean Default is true.
     * @returns string A formated currency
     */
    formatCurrency: function(value, currencyCode, showSymbol) {
        if (!Utils.isDefined(currencyCode)) {
            currencyCode = this._defaultCurrency;
        }
        if (!Utils.isDefined(showSymbol)) {
            showSymbol = true;
        }

        currencyConfig = this.getCurrencyConfig(currencyCode);

        value = parseFloat(value); // Always try to convert to float.

        var ds = currencyConfig.decimal;
        var ts = currencyConfig.thousand;

        var result = value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'); // Transform to a string with decimal as dot and comma in thousand
        // Now we will work in replace decimal and thousand separator
        if (ds != '.' || ts != ',') {
            // If separators are differente for previous patter in result, we have to replace signs
            result = result.replace(/,/g, '|').replace(/\./g, ds).replace(/\|/g, ts);
        }
        // Now return with symbol
        if (showSymbol) {
            if (currencyConfig.position == 'start') {
                result = currencyConfig.symbol + ' ' + result;
            } else {
                result += ' ' + currencyConfig.symbol;
            }
        }
        return result;
    },
    /**
     * Search for a currency with Currency code or currency symbol.
     * Because currency Configs are in array format to be more legible. This method returns a structured currencyConfig object:
     * @returns Object In the following format: {'code': 'EUR', 'symbol': '€', decimal: '.', thousand: ','}
     */
    getCurrencyConfig: function(currencyCode) {
        var currencyConfig = this._currencies[currencyCode];
        if (!currencyConfig) {
            // If not found a key, we try to find by currency symbol
            for (var key in this._currencies) {
                // The check for hasOwnProperty is because this loop can get another object parent property
                if (this._currencies.hasOwnProperty(key)) {
                    if (this._currencies[key][0] == currencyCode) {
                        currencyCode = key;
                        currencyConfig = this._currencies[key];
                        break;
                    }
                }
            }
        }
        return this._currencyConfigObject(currencyCode, currencyConfig);
    },
    _currencyConfigObject: function(currencyCode, currencyConfig) {
        if (!currencyCode || !currencyConfig || currencyConfig.length != 3) return null;
        return {code: currencyCode, symbol: currencyConfig[0], decimal: currencyConfig[1], thousand: currencyConfig[2], position: currencyConfig[3]};
    },
    /**
     * A list of currencies to be used in Currency format
     * The format is: [Currency Symbol, Decimal Separator, Thousand separator, symbol_position]
     */
    _currencies: {
        'EUR': ['€', ',', '.', 'end'],
        'USD': ['$', '.', ',', 'start'],
        'BRL': ['R$', ',', '.', 'end']
    },
}

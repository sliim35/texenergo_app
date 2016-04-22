/**
 * Created by Egor Lobanov on 22.03.16.
 * Использование:
 * Добавить к элементу атрибут te-copy-to-buffer
 * Дочерние элементы из которых необходимо скопировать значение,
 * необходимо пометить атрибутом te-buffer-value
 */
(function(){

    "use strict";

    angular.module('teBuffer', []).directive('teCopyToBuffer', ['$timeout', '$compile', function($timeout, $compile){
        return {
            restrict: 'A',
            transclude: true,
            link: function(scope, element, attrs){
                var input = element.find(".te-c-buffer-input"),
                    btn = element.find('.te-c-to-buffer-ico'),
                    iScope = scope.$new(true);

                iScope.showTeCopyToBufferTooltip = false;

                $compile(btn)(iScope);

                var copy = function(){
                    var value = "",
                        vals = element.find("[te-buffer-value='']"),
                        length = vals.length;

                    vals.each(function(index, item){
                        var name = item.nodeName,
                            method = (name === "INPUT" || name === "TEXTAREA" ? 'val' : 'html'),
                            separator = (length>1 && index !== length-1 ? " | " : "");

                        value += $(item)[method]() + separator;
                    });
                    input.val(value);
                    input.focus();
                    input.select();
                    document.execCommand('copy');
                    btn.addClass('animate');
                    iScope.showTeCopyToBufferTooltip = true;
                    $timeout(function(){
                        btn.removeClass('animate');
                        iScope.showTeCopyToBufferTooltip = false;
                    },820);
                };

                btn.click(copy);

                scope.$on("$destroy", function(){
                    btn.off("click", copy);
                });
            },
            template: '<ng-transclude></ng-transclude>' +
                '<i class="fa fa-copy te-c-to-buffer-ico" uib-tooltip="Скопировано!" tooltip-trigger="none" tooltip-is-open="showTeCopyToBufferTooltip">' +
                '<input class="te-c-buffer-input" type="text">' +
                '</i>'
        }
    }]);
}());
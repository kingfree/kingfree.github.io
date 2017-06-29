module Jekyll
  module DateChinese
    def date_chinese(input)
      input = time(input)
      numbers = %w(〇 一 二 三 四 五 六 七 八 九)
      days = %w(〇 一 二 三 四 五 六 七 八 九 十 十一 十二 十三 十四 十五 十六 十七 十八 十九 廿 廿一 廿二 廿三 廿四 廿五 廿六 廿七 廿八 廿九 卅 卅一)
      months = %w(nil 一月 二月 三月 四月 五月 六月 七月 八月 九月 十月 十一月 十二月)
      years = input.year.to_s
      res = ""
      years.each_char {|c| res += numbers[c.to_i] }
      res += '年' + months[input.month] + days[input.day] + '日'
    end
  end
end

Liquid::Template.register_filter(Jekyll::DateChinese)
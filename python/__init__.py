import os
import datetime
import time
from datetime import date
from pathlib import Path
import csv
import pymysql
import schedule


def func():
    today = date.today()
    oneday = datetime.timedelta(days=1)
    yesterday = today - oneday
    db = pymysql.connect()
    cursor = db.cursor()

    d1 = today.strftime("%Y.%m.%d")
    d2 = yesterday.strftime("%Y-%m-%d")
    my_file = Path("./DXYArea_" + d1 + ".csv")
    print("d1 =", d1)
    if not my_file.exists():
        os.system("wget " + "https://github.com/BlankerL/DXY-COVID-19-Data/releases/download/" + d1 + "/DXYArea.csv"
                  + " -O " + "DXYArea_" + d1 + ".csv")
    print("OK")
    with open(my_file.name) as f:
        render = csv.reader(f)
        header_row = next(render)
        print(header_row)
        for row in render:
            colStr = []
            flag = False
            for col in row:
                newCol = col
                if d2 in col:
                    flag = True
                elif col is None or col == '':
                    flag = False
                elif "'" in col:
                    newCol = col.replace("'", "\\'")
                colStr.append(newCol)
            if flag:
                print(flag)
                print(colStr)
                sql = "insert into `DXYArea_Test` (continentName, continentEnglishName, countryName, countryEnglishName, provinceName, provinceEnglishName, province_zipCode, province_confirmedCount, province_suspectedCount, province_curedCount, province_deadCount, updateTime, cityName, cityEnglishName, city_zipCode, city_confirmedCount, city_suspectedCount, city_curedCount, city_deadCount) \
                values ('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')" % \
                      (str(colStr[0]), str(colStr[1]), str(colStr[2]), str(colStr[3]), str(colStr[4]),
                       str(colStr[5]), str(colStr[6]), str(colStr[7]), str(colStr[8]), str(colStr[9]),
                       str(colStr[10]), str(colStr[11]), str(colStr[12]), str(colStr[13]), str(colStr[14]),
                       str(colStr[15]), str(colStr[16]), str(colStr[17]), str(colStr[18]))
                # 执行sql语句
                cursor.execute(sql)
                db.commit()

        db.close()


if __name__ == '__main__':
    func()
    # schedule.clear()
    # schedule.every(1).days.do(func)
    # while True:
    #     schedule.run_pending()
    #     time.sleep(1)

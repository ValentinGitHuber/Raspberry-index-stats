# Instalarea imaginii Raspbian Stretch Light

1. Formatez flash drive
2. Cu Etcher instalez imaginea pe flash drive
3. Conectez tastatura si ecran

## Pentru instalarea imaginii fără monitor, mouse, tastatură

Intru pe flash card (în boot)
Creez un file cu numele ssh fără extensie
Creez alt file cu numele wpa_supplicant.conf si inserez acest text in el:

```console
country=US
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
    ssid="DIR-620"
    scan_ssid=1
    psk="078800031"
    key_mgmt=WPA-PSK
}
```

### Intru in consola

Login: `pi`
Password: `raspberry`

Setez parola pentru root 
`$ sudo passwd root`

Intru ca super-user
`$ su`

Setez wi-fi si ssh
`$ raspi-config`

Update la packages
`$ apt-get update`
`$ apt-get upgrade`

Aflu IP (inet)
`$ ifconfig`

`$ raspi-config`
Pentru a seta timpul


## Conectarea prin SSH

`$ ssh pi@192.168.0.98`
(parola123)

In cazul erorii:

@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

`$ cd /Users/valentin/.ssh`
`$ nano known_hosts`

Sterg campul cu key pentru raspberry

Turn off / Restart raspberry

`$ sudo shutdown -h now`
`$ sudo reboot`


## Măsurarea presiunii și umidității cu DHT22

1. se introduce în Ground (pin 6)
2. se introduce în Power (pin 1,2,4)
3. out se introduce în GPIO4 (pin 7)

```console
$ sudo apt-get update
$ sudo apt-get install build-essential python-dev python-openssl git
$ git clone https://github.com/adafruit/Adafruit_Python_DHT.git && cd Adafruit_Python_DHT
$ sudo python setup.py install
$ cd examples
$ sudo ./AdafruitDHT.py 22 4
```

## Pentru a integra în alte fișiere python:

```console
import Adafruit_DHT
...
sensor = Adafruit_DHT.DHT22
pin = 4
humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)
...
```

## Creare file python

`$ cat > nume_file.py`

Inserezi text si apoi ctrl + d pentru ieșire

## Verificare versiune python

Inserez într-un fișier python

```console
import platform
python_version=platform.python_version()
print (python_version)
```

## Instalare Mongo pe Raspbian

```console
$ sudo apt-get update
$ sudo apt-get upgrade
$ sudo apt-get install mongodb-server
$ service mongod start
$ mongo
$ mongod --version
```

## Instalare PIP (python package manager)

```console
$ curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
$ python get-pip.py
```

## Instalare PyMongo

`$ pip install pymongo==3.4.0`

*Versiunea mai noua afișează probleme de compatibilitate*

## Trimitere date către Mongo din Python

```console
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
db = client.test_database
collection = db.test_collection
import datetime
post = {"author": "Valentin","date": datetime.datetime.utcnow()}
posts = db.posts
posts.insert_one(post)
```

## Creare service ce se pornește după restart

```console
$ cd /lib/systemd/system
$ cat > dht.service (ctrl + d)
$ nano dht.service

[Unit]
Description=DHT service to send data to mongo database
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
User=pi
ExecStart=/usr/bin/env node /var/test/main.js
Environment=PORT=3000
Environment=MONGO_URL=mongodb://localhost:27017/test
Environment=ROOT_URL=http://localhost

[Install]
WantedBy=multi-user.target
```

```console
$ systemctl daemon-reload
$ systemctl start dht
$ systemctl enable dht
$ service dht status
$ reboot
```

## Instalare Meteor conectat la Mongo de pe Raspberry

Pe laptop șterg toate versiunile de node, mongo, meteor de pe calculator

```console
$ curl "https://install.meteor.com/?release=1.3.5.1" | sh
$ meteor create test --release 1.3.5.1
$ cd test
$ meteor npm init -y  (pentru a initializa npm package files)
$ MONGO_URL='mongodb://192.168.0.98:27017/test' meteor
```

*Mențiune!* MongoDB poate stoca până la 2GB, împreună cu indexări.

## Deploy la imagine

#### De pe laptop

```console
$ cd test
$ meteor build --directory ../dist
$ cd ../dist
$ mv bundle test
$ tar -zcf test.tar.gz test
$ scp test.tar.gz pi@192.168.0.98:/var/test.tar.gz
```
*Aici ar putea fi probleme de permisiune*

#### De pe Raspberry

```console
$ cd /var
$ rm -rf test (daca a mai fost instalat odata)
$ tar -zxvf test.tar.gz
$ apt-get install node
$ node -v
$ npm install -g  n
$ n 4.2.3
$ apt-get install npm
$ npm -v
$ npm install -g npm@2.14.7
$ apt-get install mongodb
$ service mongodb start
$ cd test/programs/server
$ npm install
$ cd /var/test
$ export PORT=3000
$ export ROOT_URL=http://localhost
$ export MONGO_URL='mongodb://localhost:27017/test'
$ node main.js
```

Deschide http://192.168.0.98:3000/

Vizualizarea grafică a bazei de date se poate face cu Robo 3T conectând la 192.168.0.98:27017



## Versiune de python app

```console
import Adafruit_DHT, time, threading
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
current = client.weather.current
values = client.weather.values

def currentCollection():
    while True:
        humidity, temperature = Adafruit_DHT.read_retry(Adafruit_DHT.DHT22, 4)
        humidity = "{0:0.1f}".format(humidity)
        temperature = "{0:0.1f}".format(temperature)
        data = {"t": temperature, "u": humidity, "d": time.strftime("%Y-%m-%d %H:%M:%S")}
        current.drop()
        current.insert_one(data)
        time.sleep(10)

def valuesCollection():
    while True:
        humidity, temperature = Adafruit_DHT.read_retry(Adafruit_DHT.DHT22, 4)
        humidity = "{0:0.1f}".format(humidity)
        temperature = "{0:0.1f}".format(temperature)
        data = {"t": temperature, "u": humidity, "d": time.strftime("%Y-%m-%d %H:%M:%S")}
        values.insert_one(data)
        time.sleep(1800)

thread1 = threading.Thread(target=currentCollection)
thread1.start()

thread2 = threading.Thread(target=valuesCollection)
thread2.start()
```

## Verificare memorie disponibilă pe raspberry

`$ df -h`

Implementarea notificarilor se poate face cu  
https://codepen.io/ionic/pen/zkmhJ


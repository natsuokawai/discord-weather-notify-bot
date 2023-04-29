const WEATHER_FORECAST_API_URL = 'https://weather.tsukumijima.net/api/forecast?city=000000';
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/0000000000000000000/xxxxxxxxxxxxxxxxxxx';

const EMOJI = {
  MAX_TEMP: ':small_orange_diamond:',
  MIN_TEMP: ':small_blue_diamond:',
  SUNNY: ':sunny:',
  CLOUDY: ':cloud:',
  RAINY: ':umbrella: ',
  SNOWY: ':snowman:',
}

function main() {
  sendWeatherForecastToDiscord();
}

function sendWeatherForecastToDiscord() {
  const data = fetchWeatherForecast();
  const message = createMessageFromResponse(data)

  requestDiscordWebhook(message)
}

function fetchWeatherForecast() {
  const response = UrlFetchApp.fetch(WEATHER_FORECAST_API_URL);
  const data = JSON.parse(response.getContentText());
  return data;
}

function createMessageFromResponse(data) {
  const tomorrow = 1;
  const forecast = data['forecasts'][tomorrow];
  const date = forecast['date'];
  const weather = weatherEmojify(forecast['telop']);
  const minTemp = forecast['temperature']['min']['celsius'];
  const maxTemp = forecast['temperature']['max']['celsius'];
  const weatherDetail = removeFullWidthSpaces(forecast['detail']['weather']);
  const wind = removeFullWidthSpaces(forecast['detail']['wind']);
  const chanceOfRain = formatChanceOfRain(forecast['chanceOfRain']);

  return [
    `**${date}**の天気`,
    '',
    weather,
    `${EMOJI.MAX_TEMP} ${maxTemp}℃ / ${EMOJI.MIN_TEMP} ${minTemp}℃`,
    '',
    weatherDetail,
    wind,
    '',
    chanceOfRain,
  ].join('\n');
}

function formatChanceOfRain(chanceOfRain) {
  return [
    '降水確率',
    `・0~6時: ${chanceOfRain['T00_06']}`,
    `・6~12時: ${chanceOfRain['T06_12']}`,
    `・12~18時: ${chanceOfRain['T12_18']}`,
    `・18~24時: ${chanceOfRain['T18_24']}`,
  ].join('\n');
}

function removeFullWidthSpaces(text) {
  return text.replace(/　/g, '');
}

function weatherEmojify(text) {
  const weatherEmojis = {
    '晴れ': EMOJI.SUNNY,
    '晴': EMOJI.SUNNY,
    'くもり': EMOJI.CLOUDY,
    '曇り': EMOJI.CLOUDY,
    '曇': EMOJI.CLOUDY,
    '雨': EMOJI.RAINY,
    '雪': EMOJI.SNOWY,
  };

  for (const weather in weatherEmojis) {
    const regex = new RegExp(weather, 'g');
    text = text.replace(regex, ` ${weatherEmojis[weather]} `);
  }

  return text.trim();
}

function requestDiscordWebhook(message) {
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify({
      'content': message
    })
  };

  UrlFetchApp.fetch(DISCORD_WEBHOOK_URL, options);
}

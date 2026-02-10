/**
 * jsHue
 * JavaScript library for Philips Hue.
 *
 * @module jshue
 * @version 2.1.1
 * @author John Peloquin
 * @copyright Copyright 2013 - 2017, John Peloquin and the jsHue contributors.
 */
const jsHueAPI = (fetch, Response, JSON, Promise) => {
  const _requestJson = (method, url, data) =>
    new Promise((resolve) => {
      resolve(data !== null ? JSON.stringify(data) : data)
    })
      .then((body) => fetch(url, { method, body }))
      .then((response) => response.json())

  const _requestJsonUrl = (method, url) => _requestJson(method, url, null)
  const _get = _requestJsonUrl.bind(null, 'GET')
  const _put = _requestJson.bind(null, 'PUT')
  const _post = _requestJson.bind(null, 'POST')
  const _delete = _requestJsonUrl.bind(null, 'DELETE')
  const _parametrize = (method, url) => (p, ...rest) => method(url(p), ...rest)
  const _echo = (baseUrl) => (url, data) =>
    Promise.resolve(
      new Response(
        JSON.stringify({
          address: url.slice(baseUrl.length),
          method: data.method,
          body: JSON.parse(data.body),
        }),
      ),
    )

  return {
    discover: _get.bind(null, 'https://discovery.meethue.com/'),
    bridge: (ip) => {
      const _baseUrl = `http://${ip}/api`
      const _userUrl = (user) => `${_baseUrl}/${user}`
      const _lightUrl = (id) => `${_userUrl(id)}/lights`
      const _groupUrl = (id) => `${_userUrl(id)}/groups`
      const _scheduleUrl = (id) => `${_userUrl(id)}/schedules`
      const _sceneUrl = (id) => `${_userUrl(id)}/scenes`
      const _ruleUrl = (id) => `${_userUrl(id)}/rules`
      const _linksUrl = `${_userUrl('')}/resourcelinks`
      const _linkUrl = (id) => `${_linksUrl}/${id}`

      return {
        createUser: (app) => _post(_baseUrl, { devicetype: app }),
        user: (username) => ({
          getConfig: _get.bind(null, _userUrl(username)),
          getLights: _get.bind(null, _lightUrl(username)),
          createLight: _post.bind(null, _lightUrl(username)),
          getLight: _parametrize(_get, (id) => `${_lightUrl(username)}/${id}`),
          setLight: _parametrize(_put, (id) => `${_lightUrl(username)}/${id}`),
          setLightState: _parametrize(
            _put,
            (id) => `${_lightUrl(username)}/${id}/state`,
          ),
          deleteLight: _parametrize(_delete, (id) => `${_lightUrl(username)}/${id}`),
          getGroups: _get.bind(null, _groupUrl(username)),
          createGroup: _post.bind(null, _groupUrl(username)),
          getGroup: _parametrize(_get, (id) => `${_groupUrl(username)}/${id}`),
          setGroup: _parametrize(_put, (id) => `${_groupUrl(username)}/${id}`),
          setGroupState: _parametrize(
            _put,
            (id) => `${_groupUrl(username)}/${id}/action`,
          ),
          deleteGroup: _parametrize(_delete, (id) => `${_groupUrl(username)}/${id}`),
          getSchedules: _get.bind(null, _scheduleUrl(username)),
          createSchedule: _post.bind(null, _scheduleUrl(username)),
          getSchedule: _parametrize(
            _get,
            (id) => `${_scheduleUrl(username)}/${id}`,
          ),
          setSchedule: _parametrize(
            _put,
            (id) => `${_scheduleUrl(username)}/${id}`,
          ),
          deleteSchedule: _parametrize(
            _delete,
            (id) => `${_scheduleUrl(username)}/${id}`,
          ),
          scheduleCommandGenerator: () =>
            jsHueAPI(_echo(_userUrl(username)), Response, JSON, Promise).bridge(ip).user(username),
          getScenes: _get.bind(null, _sceneUrl(username)),
          createScene: _post.bind(null, _sceneUrl(username)),
          getScene: _parametrize(_get, (id) => `${_sceneUrl(username)}/${id}`),
          setScene: _parametrize(_put, (id) => `${_sceneUrl(username)}/${id}`),
          deleteScene: _parametrize(_delete, (id) => `${_sceneUrl(username)}/${id}`),
          getRules: _get.bind(null, _ruleUrl(username)),
          createRule: _post.bind(null, _ruleUrl(username)),
          getRule: _parametrize(_get, (id) => `${_ruleUrl(username)}/${id}`),
          setRule: _parametrize(_put, (id) => `${_ruleUrl(username)}/${id}`),
          deleteRule: _parametrize(_delete, (id) => `${_ruleUrl(username)}/${id}`),
          ruleActionGenerator: () =>
            jsHueAPI(_echo(_userUrl(username)), Response, JSON, Promise).bridge(ip).user(username),
          getResourceLinks: _get.bind(null, _linksUrl),
          createResourceLink: _post.bind(null, _linksUrl),
          getResourceLink: _parametrize(_get, _linkUrl),
          setResourceLink: _parametrize(_put, _linkUrl),
          deleteResourceLink: _parametrize(_delete, _linkUrl),
        }),
      }
    },
  }
}

const jsHue = jsHueAPI.bind(null, fetch, Response, JSON, Promise)

export default jsHue

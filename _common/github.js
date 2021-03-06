'use strict';

/**
 * Gets the releases for 'ripgrep'. This function could be trimmed down and made
 * for use with any github release.
 *
 * @param request
 * @param {string} owner
 * @param {string} repo
 * @returns {PromiseLike<any> | Promise<any>}
 */
function getAllReleases(
  request,
  owner,
  repo,
  baseurl = 'https://api.github.com'
) {
  if (!owner) {
    return Promise.reject('missing owner for repo');
  }
  if (!repo) {
    return Promise.reject('missing repo name');
  }
  return request({
    url: `${baseurl}/repos/${owner}/${repo}/releases`,
    json: true
  }).then((resp) => {
    const gHubResp = resp.body;
    const all = {
      releases: [],
      // todo make this ':baseurl' + ':releasename'
      download: ''
    };

    gHubResp.forEach((release) => {
      release['assets'].forEach((asset) => {
        const name = asset['name'];
        all.releases.push({
          name: name,
          version: release['tag_name'], // TODO tags aren't always semver / sensical
          lts: /(\b|_)(lts)(\b|_)/.test(release['tag_name']),
          channel: !release['prerelease'] ? 'stable' : 'beta',
          date: (release['published_at'] || '').replace(/T.*/, ''),
          os: '', // will be guessed by download filename
          arch: '', // will be guessed by download filename
          ext: '', // will be normalized
          download: asset['browser_download_url']
        });
      });
    });

    return all;
  });
}

module.exports = getAllReleases;

if (module === require.main) {
  getAllReleases(require('@root/request'), 'BurntSushi', 'ripgrep').then(
    function (all) {
      console.info(JSON.stringify(all, null, 2));
    }
  );
}

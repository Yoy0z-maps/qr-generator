// 최신 Xcode는 iOS 15.0 미만 배포 타깃을 빌드하지 못한다.
// React Native의 post_install(updateOSDeploymentTarget)은 Pod 본 타깃만 최소 버전으로 올리고
// 리소스 번들 타깃(AsyncStorage, SDWebImage, RNSVG, Google Mobile Ads 등)은 그대로 두기 때문에
// "IPHONEOS_DEPLOYMENT_TARGET is set to 12.0 ... supported range is 15.0 to ..." 오류가 난다.
// ios/ 폴더는 prebuild로 다시 생성되므로 Podfile을 직접 고치지 않고 이 플러그인으로 post_install에 주입한다.
const { withPodfile } = require("expo/config-plugins");
const {
  mergeContents,
} = require("@expo/config-plugins/build/utils/generateCode");

const DEFAULT_DEPLOYMENT_TARGET = "15.1"; // React Native 0.81 최소 지원 버전

function addPodsDeploymentTargetFix(podfile, deploymentTarget) {
  return mergeContents({
    tag: "qr-generator-pods-deployment-target",
    src: podfile,
    newSrc: [
      "    # 모든 Pod 타깃(리소스 번들 포함)의 배포 타깃을 최소 버전 이상으로 맞춤",
      "    installer.pods_project.targets.each do |target|",
      "      target.build_configurations.each do |build_config|",
      "        current = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']",
      `        if current && current.to_f < ${deploymentTarget}`,
      `          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${deploymentTarget}'`,
      "        end",
      "      end",
      "    end",
    ].join("\n"),
    anchor: /post_install do \|installer\|/,
    offset: 1,
    comment: "#",
  }).contents;
}

const withPodsDeploymentTarget = (
  config,
  { deploymentTarget = DEFAULT_DEPLOYMENT_TARGET } = {}
) =>
  withPodfile(config, (cfg) => {
    cfg.modResults.contents = addPodsDeploymentTargetFix(
      cfg.modResults.contents,
      deploymentTarget
    );
    return cfg;
  });

module.exports = withPodsDeploymentTarget;
module.exports.addPodsDeploymentTargetFix = addPodsDeploymentTargetFix;

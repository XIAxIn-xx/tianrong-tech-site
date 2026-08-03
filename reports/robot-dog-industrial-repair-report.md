# 天戎科技机器狗工业化修复报告

生成时间：2026-08-03T06:41:06.943646+00:00

## 输入与安全边界

- 使用当前工业化文件：`artifacts/robot-dog-industrial/tianrong-robot-dog-industrial-final.blend`
- 工作副本：`artifacts/robot-dog-industrial/tianrong-robot-dog-industrial-repair-v2.blend`
- 原当前工业化 V1 未覆盖：`public/models/tianrong-robot-dog-industrial.glb`
- 未读取原始 FBX 作为制作输入；未安装依赖或插件；未修改原骨骼、关键帧、原点和比例。

## 保留与清理

- 保留 `SPOT_BODY`、`FRONT_LEG`、`REAR_R_LEG`、2 个原 Armature、原动画动作和源网格。
- 保留工业化材质分层、承重逻辑、髋部连接方向和腿部对称 Mirror 关系，并以更少的外部结构重新组织。
- 清理上一版带 `TR_Industrial_Generated` 标记的 75 个新增对象，包括薄顶部盖板/载荷叠板/导轨、重复紧固件、悬浮腿部圆柱和静态散落护罩；未删除源网格。
- 本轮新增对象数：82；全部带 `industrial_generated=true`、`TR_Repair_Generated=true`，可重复运行。

## 顶部一体化功能舱

- 对象：`Industrial_UpperModule_Shell`、`Industrial_UpperModule_Base`、`Industrial_TopInset_Panel`、`Industrial_FunctionBand`、`Industrial_UpperMount_*`、`Industrial_TopMountHole_*`。
- 外壳使用开口厚壁结构，保留侧壁、底部体积和连续浅灰包边；顶部不再是薄托盘或三层叠板。
- 深灰面板位于外壳内部开口下方，四周保留浅灰边框，使用 6 个统一安装孔表达模块化载荷安装。
- 功能舱最终尺寸约为 W=0.6340345776081086、L=1.8915332794189452、H=0.20500000000000002；相对机身比例 W=0.76、L=0.72、H=0.31936441516036246。
- `Industrial_FunctionBand` 紧贴机身顶部，`Industrial_UpperModule_Base` 与其连续承接；全部父级为 `SPOT_BODY`，保留世界变换。

## 机身、传感器与腿部

- 底部：`Industrial_BottomFrame_Core`、双侧承重轨和贴合式 `Industrial_BottomGuard_Plate`，形成连续承重结构但保留腿部运动空间。
- 正面传感器：删除上一版平直黑色矩形，改为圆角烟熏玻璃窗口和左右对称小镜头；无发光、无蓝色灯带。
- 腿部：删除无法与当前 FBX 骨骼坐标贴合的新增护罩、套筒和脚端，保留原腿网格、原脚部和原动画；新增腿部零件为零，避免悬浮和运动脱离。橡胶材质改用于贴合底部护板的耐磨垫。
- 髋部：保留四个清晰安装座与关节体块，父级绑定到机身根对象。

## 材质

- `Shell_WarmGray`：暖灰喷涂外壳；`Frame_Graphite`：石墨承重件；`Joint_DarkMetal`：深灰喷砂关节。
- `Rubber_Black`：高粗糙度耐磨件；`Sensor_SmokedGlass`：低反射烟熏传感器；`TopInset_Composite`：深灰哑光顶面；`Accent_BrandBlue`：极少量非发光品牌色。

## 自动验证

- 源动画签名：Armature=['Armature', 'Armature.001']；动作=4 组，原动作数据未改写。
- 动画采样帧：[1, 48, 95, 142, 190]；新增对象变换/父级检测：`passed`。
- 修复场景悬浮、负缩放、零体积、未绑定网格和顶部比例检测：`passed`；未绑定网格：`[]`；远离机身对象：`[]`。
- GLB 重新导入：`passed`；对象=53；网格=44；Armature=2；动画存在=True；材质齐全=True；顶部完整=True；相机/灯光=False。

## 预览与输出

- [front-3q.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/repair-previews/front-3q.png)
- [side.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/repair-previews/side.png)
- [rear-3q.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/repair-previews/rear-3q.png)
- [front.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/repair-previews/front.png)
- [bottom.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/repair-previews/bottom.png)
- [top-3q.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/repair-previews/top-3q.png)
- [top-side-detail.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/repair-previews/top-side-detail.png)
- [contact-sheet.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/repair-previews/contact-sheet.png)
- 修复 Blend：`artifacts/robot-dog-industrial/tianrong-robot-dog-industrial-repaired-final.blend`
- 修复 GLB：`public/models/tianrong-robot-dog-industrial-repaired.glb`
- 审计：`reports/robot-dog-industrial-repair-audit.json`
- 验证：`reports/robot-dog-industrial-repair-validation.json`

## 官网与检查

- GLB 通过后，官网组件保留 `INDUSTRIAL_V1_MODEL_PATH` 和 `REPAIRED_MODEL_PATH` 两条路径，仅默认切换到修复版；`next.config.mjs` 增加修复版缓存头。
- 仅调整模型展示组件镜头距离、缩放和光照，不改长卷其他模块。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm lint`：未执行；`package.json` 未定义 `lint` script。
- 修复 GLB：HTTP 200，文件大小 `2,240,560 bytes`；重新导入验证通过。
- 桌面浏览器：修复模型成功加载；控制台仅有既有 `THREE.Clock` 弃用 warning，无模型加载错误。
- 移动端 `390×844`：页面宽度正常、无横向溢出，控制台无错误。

## 一键回退与限制

- 官网回退：将 `MODEL_URL` 改为 `INDUSTRIAL_V1_MODEL_PATH`；V1 GLB 未删除。
- 限制：源 FBX 只有两个腿 Armature；镜像腿结构仍共享对应源骨骼的动画跟随逻辑，不新增骨骼。若后续需要左右腿独立相位，应在真实四腿 rig 上补充对应骨骼后再制作动画。

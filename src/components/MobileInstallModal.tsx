import React, { useState } from 'react';
import {
  Smartphone,
  X,
  Share,
  PlusSquare,
  Check,
  Copy,
  Download,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileInstallModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>(
    isIOS ? 'ios' : 'android'
  );

  if (!isOpen) return null;

  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-7cyemrogcvmugtakxhjtmq-878757225357.us-east1.run.app';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    appUrl
  )}&bgcolor=ffffff&color=000000&margin=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-neutral-400" />
            <h3 className="text-sm font-medium text-neutral-100">安装到手机</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code */}
        <div className="my-5 p-4 bg-neutral-900 border border-neutral-850 rounded-xl flex flex-col items-center text-center">
          <div className="w-28 h-28 bg-white rounded-lg p-1.5 shrink-0 flex items-center justify-center">
            <img src={qrCodeUrl} alt="扫码打开" className="w-full h-full object-contain" />
          </div>
          <div className="text-xs text-neutral-400 mt-3">手机扫码直接打开</div>
          <button
            onClick={handleCopyUrl}
            className="mt-2 text-[11px] font-mono text-neutral-500 hover:text-neutral-300 underline cursor-pointer"
          >
            {copied ? '已复制网址' : '复制手机端访问网址'}
          </button>
        </div>

        {/* Direct install button if supported */}
        {isInstallable && !isInstalled && (
          <button
            onClick={install}
            className="w-full py-2.5 mb-4 bg-white text-black font-medium text-xs rounded-lg hover:bg-neutral-200 transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>一键添加到桌面</span>
          </button>
        )}

        {/* Guide Tabs */}
        <div className="space-y-2">
          <div className="flex rounded-lg bg-neutral-900 p-0.5 border border-neutral-850 text-xs">
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-1 rounded text-center transition ${
                activeTab === 'ios' ? 'bg-neutral-800 text-white' : 'text-neutral-500'
              }`}
            >
              苹果 iOS (Safari)
            </button>
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-1 rounded text-center transition ${
                activeTab === 'android' ? 'bg-neutral-800 text-white' : 'text-neutral-500'
              }`}
            >
              安卓 (Chrome/自带)
            </button>
          </div>

          <div className="p-3 bg-neutral-900/60 border border-neutral-850 rounded-lg text-xs text-neutral-400 leading-relaxed">
            {activeTab === 'ios' ? (
              <p>
                在 Safari 中打开本页面 ➔ 点击底部的<strong>「分享」</strong>图标 ➔ 选择<strong>「添加到主屏幕」</strong>即可。
              </p>
            ) : (
              <p>
                在手机浏览器中打开 ➔ 点击右上角菜单<strong>「三个点」</strong> ➔ 选择<strong>「添加至桌面」</strong>或<strong>「安装应用」</strong>。
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 text-neutral-300 text-xs rounded-lg hover:bg-neutral-850 transition"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

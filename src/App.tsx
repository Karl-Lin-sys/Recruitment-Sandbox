/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SandboxPanel } from './components/SandboxPanel';
import { Chatbot } from './components/Chatbot';

export default function App() {
  return (
    <div className="flex h-screen w-full bg-white font-sans text-gray-900 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 h-full">
        <SandboxPanel />
      </div>

      {/* Right Sidebar - Chatbot */}
      <div className="w-[400px] h-full shrink-0 border-l border-gray-200">
        <Chatbot />
      </div>
    </div>
  );
}

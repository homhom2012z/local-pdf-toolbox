'use client'

import Link from 'next/link'
import { 
  DocumentDuplicateIcon, 
  ScissorsIcon, 
  DocumentArrowDownIcon,
  PhotoIcon,
  DocumentTextIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline'

const tools = [
  {
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one document',
    href: '/merge',
    icon: DocumentDuplicateIcon,
    color: 'bg-blue-500',
    features: ['Drag & drop multiple files', 'Reorder pages', 'Maintain quality']
  },
  {
    name: 'Split PDF',
    description: 'Extract specific pages or split by page count',
    href: '/split',
    icon: ScissorsIcon,
    color: 'bg-green-500',
    features: ['Select page ranges', 'Split by page count', 'Batch processing']
  },
  {
    name: 'Extract Pages',
    description: 'Select and download individual pages from a PDF',
    href: '/extract',
    icon: DocumentArrowDownIcon,
    color: 'bg-purple-500',
    features: ['Visual page selection', 'Multiple page extraction', 'Custom naming']
  },
  {
    name: 'Convert to Image',
    description: 'Convert PDF pages to PNG or JPEG format',
    href: '/convert',
    icon: PhotoIcon,
    color: 'bg-orange-500',
    features: ['High resolution output', 'Multiple formats', 'Quality control']
  },
  {
    name: 'Image to PDF',
    description: 'Convert image files into a single PDF document',
    href: '/image-to-pdf',
    icon: DocumentTextIcon,
    color: 'bg-red-500',
    features: ['Multiple image formats', 'Auto-sizing', 'Page layout options']
  },
  {
    name: 'Password Protect',
    description: 'Add password protection to your PDF files',
    href: '/password',
    icon: LockClosedIcon,
    color: 'bg-indigo-500',
    features: ['Strong encryption', 'Permission control', 'User/owner passwords']
  },
  {
    name: 'Unlock PDF',
    description: 'Remove password protection from PDF files',
    href: '/unlock',
    icon: LockOpenIcon,
    color: 'bg-yellow-500',
    features: ['Password verification', 'Batch processing', 'Safe unlocking']
  },
  {
    name: 'Compress PDF',
    description: 'Reduce file size while maintaining quality',
    href: '/compress',
    icon: ArchiveBoxIcon,
    color: 'bg-teal-500',
    features: ['Quality settings', 'Size optimization', 'Progress tracking']
  }
]

export default function HomePage() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Hero section */}
      <div className="relative isolate px-4 pt-14 lg:px-8">
        <div className="mx-auto max-w-screen-xl py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center rounded-full bg-primary-100 px-4 py-2 text-base font-semibold text-primary-800 mb-6">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Privacy-First PDF Processing
              </div>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl mb-6">
              Your PDF Tools,
              <span className="text-primary-600"> Your Privacy</span>
            </h1>
            <p className="mt-6 text-2xl leading-9 text-gray-700 max-w-4xl mx-auto">
              Process your PDF files locally in the browser. No uploads, no servers, complete privacy. 
              Your files never leave your device.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800 shadow-sm">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                100% Local Processing
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                No Registration
              </span>
              <span className="inline-flex items-center rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-800 shadow-sm">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Open Source
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tools grid */}
      <div className="mx-auto max-w-screen-2xl px-4 lg:px-8 pb-24">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-6">
            Choose Your Tool
          </h2>
          <p className="text-2xl leading-9 text-gray-700">
            All tools process files locally in your browser. No data is sent to any server.
          </p>
        </div>
        
        <div className="mx-auto max-w-screen-2xl">
          <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group relative bg-white p-8 lg:p-10 rounded-3xl border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-primary-400 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-primary-200"
              >
                <div className="flex items-start space-x-4 mb-6 lg:mb-8">
                  <div className={`${tool.color} p-4 lg:p-5 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-xl flex-shrink-0`}>
                    <tool.icon className="h-8 w-8 lg:h-10 lg:w-10 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                      {tool.name}
                    </h3>
                    <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>
                
                <div className="mb-6 lg:mb-8">
                  <ul className="space-y-2">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm lg:text-base text-gray-600">
                        <svg className="w-4 h-4 lg:w-5 lg:h-5 mr-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center text-primary-600 font-semibold group-hover:text-primary-700 transition-colors text-base lg:text-lg">
                  Get started
                  <svg className="ml-2 w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-24 sm:py-32 border-t border-gray-100">
        <div className="mx-auto max-w-screen-2xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-primary-600 uppercase tracking-wider">Why Choose Local PDF Toolbox?</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Privacy and Security Built-In
            </p>
            <p className="mt-6 text-xl leading-8 text-gray-600">
              Unlike other PDF tools that upload your files to servers, our tools process everything locally in your browser.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card flex flex-col items-center text-center p-8">
              <div className="bg-primary-100 p-4 rounded-2xl mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Complete Privacy</h3>
              <p className="text-gray-600 leading-relaxed">
                Your files never leave your device. All processing happens locally in your browser, ensuring your data remains private and secure.
              </p>
            </div>
            <div className="card flex flex-col items-center text-center p-8">
              <div className="bg-primary-100 p-4 rounded-2xl mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No Registration</h3>
              <p className="text-gray-600 leading-relaxed">
                Start using our tools immediately. No accounts, no sign-ups, no personal information required. Just upload and process.
              </p>
            </div>
            <div className="card flex flex-col items-center text-center p-8">
              <div className="bg-primary-100 p-4 rounded-2xl mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Open Source</h3>
              <p className="text-gray-600 leading-relaxed">
                Our code is open source and transparent. You can inspect, modify, and contribute to the project on GitHub.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 